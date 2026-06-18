import prisma from '../lib/prisma';
import { Router, Request, Response } from 'express';
// @ts-ignore
import bcrypt from 'bcrypt';
// @ts-ignore
import jwt from 'jsonwebtoken';
// @ts-ignore
import { authenticator } from 'otplib';
// @ts-ignore
import qrcode from 'qrcode';
import { requireAuth } from '../middleware/auth';

const router = Router();

const JWT_SECRET     = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET + '_refresh';
const FRONTEND_URL   = process.env.FRONTEND_URL || 'http://localhost:3000';

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseUserAgent(ua: string) {
  const browser =
    ua.includes('Chrome')  ? 'Chrome'  :
    ua.includes('Firefox') ? 'Firefox' :
    ua.includes('Safari')  ? 'Safari'  :
    ua.includes('Edge')    ? 'Edge'    : 'Unknown';

  const os =
    ua.includes('Windows') ? 'Windows' :
    ua.includes('Mac')     ? 'macOS'   :
    ua.includes('Linux')   ? 'Linux'   :
    ua.includes('Android') ? 'Android' :
    ua.includes('iOS')     ? 'iOS'     : 'Unknown';

  const deviceName = `${browser} on ${os}`;
  return { browser, os, deviceName };
}

function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

async function issueTokens(userId: string, role: string, req: Request) {
  const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId, role, type: 'refresh' }, REFRESH_SECRET, { expiresIn: '30d' });

  const ua    = req.headers['user-agent'] || '';
  const { browser, os, deviceName } = parseUserAgent(ua);
  const ip    = getClientIp(req);

  await prisma.userSession.create({
    data: { userId, refreshToken, browser, os, deviceName, ipAddress: ip },
  });

  return { accessToken, refreshToken };
}

async function logLogin(userId: string, req: Request, status: 'SUCCESS' | 'FAILED' | 'BLOCKED', failReason?: string) {
  const ua   = req.headers['user-agent'] || '';
  const { browser, os, deviceName } = parseUserAgent(ua);
  const ip   = getClientIp(req);
  await prisma.loginHistory.create({
    data: {
      userId, ipAddress: ip, browser, os, deviceName, status,
      ...(failReason !== undefined ? { failReason } : {}),
    },
  });
}

// ── REGISTER ────────────────────────────────────────────────────────────────

router.post('/register', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, name, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, name, role: role || 'BUYER' },
    });

    res.status(201).json({ message: 'Account created', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGIN ───────────────────────────────────────────────────────────────────

router.post('/login', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password, totpCode } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: 'This account has been banned.' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: `Account suspended: ${user.suspendedReason || 'contact support'}` });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses social login. Use Google or GitHub.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logLogin(user.id, req, 'FAILED', 'Wrong password');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2FA check
    if (user.twoFactorEnabled) {
      if (!totpCode) {
        // Signal frontend to prompt for TOTP
        return res.status(202).json({ requires2FA: true, tempUserId: user.id });
      }
      const valid = authenticator.check(totpCode, user.twoFactorSecret!);
      if (!valid) {
        // Check backup codes
        const backupCodes = await prisma.twoFactorBackupCode.findMany({
          where: { userId: user.id, used: false },
        });
        const matchedCode = await Promise.all(
          backupCodes.map(async bc => ({
            ...bc,
            match: await bcrypt.compare(totpCode, bc.code),
          }))
        );
        const validBackup = matchedCode.find(bc => bc.match);
        if (!validBackup) {
          await logLogin(user.id, req, 'FAILED', 'Invalid 2FA code');
          return res.status(400).json({ message: 'Invalid 2FA code' });
        }
        // Consume backup code
        await prisma.twoFactorBackupCode.update({
          where: { id: validBackup.id },
          data: { used: true, usedAt: new Date() },
        });
      }
    }

    const { accessToken, refreshToken } = await issueTokens(user.id, user.role, req);
    await logLogin(user.id, req, 'SUCCESS');

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id:       user.id,
        email:    user.email,
        name:     user.name,
        role:     user.role,
        avatar:   user.avatar   || null,
        verified: user.verified || false,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── REFRESH TOKEN ─────────────────────────────────────────────────────────

router.post('/refresh', async (req: Request, res: Response): Promise<any> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const session = await prisma.userSession.findUnique({ where: { refreshToken } });
    if (!session || session.isRevoked) {
      return res.status(401).json({ message: 'Session revoked or not found' });
    }

    // Update last active
    await prisma.userSession.update({
      where: { id: session.id },
      data: { lastActive: new Date() },
    });

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || user.isBanned || user.isSuspended) {
      return res.status(403).json({ message: 'Account restricted' });
    }

    const newAccessToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
    return res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGOUT (single session) ───────────────────────────────────────────────

router.post('/logout', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.userSession.updateMany({
        where: { refreshToken },
        data:  { isRevoked: true },
      });
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGOUT ALL DEVICES ────────────────────────────────────────────────────

router.post('/logout-all', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    await prisma.userSession.updateMany({
      where: { userId },
      data:  { isRevoked: true },
    });
    res.json({ message: 'Logged out from all devices' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── SESSIONS LIST ─────────────────────────────────────────────────────────

router.get('/sessions', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const sessions = await prisma.userSession.findMany({
      where:   { userId, isRevoked: false },
      orderBy: { lastActive: 'desc' },
      select:  { id: true, deviceName: true, browser: true, os: true, ipAddress: true, country: true, lastActive: true, createdAt: true },
    });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── REVOKE SPECIFIC SESSION ───────────────────────────────────────────────

router.delete('/sessions/:id', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const { id } = req.params as Record<string, string>;
    const session = await prisma.userSession.findFirst({ where: { id, userId } });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    await prisma.userSession.update({ where: { id }, data: { isRevoked: true } });
    res.json({ message: 'Session revoked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── LOGIN HISTORY ─────────────────────────────────────────────────────────

router.get('/login-history', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const page   = parseInt(String(req.query.page ?? "")) || 1;
    const limit  = 20;
    const history = await prisma.loginHistory.findMany({
      where:   { userId },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    });
    const total = await prisma.loginHistory.count({ where: { userId } });
    res.json({ data: history, total, page });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── 2FA SETUP ─────────────────────────────────────────────────────────────

router.post('/2fa/setup', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const user   = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const secret  = authenticator.generateSecret();
    const appName = 'ZilVerse';
    const otpauth = authenticator.keyuri(user.email!, appName, secret);
    const qrDataUrl = await qrcode.toDataURL(otpauth);

    // Store secret temporarily (not enabled until verified)
    await prisma.user.update({ where: { id: userId }, data: { twoFactorSecret: secret } });

    res.json({ secret, qrDataUrl, otpauth });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── 2FA VERIFY (enable) ───────────────────────────────────────────────────

router.post('/2fa/verify', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const { code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorSecret) return res.status(400).json({ message: 'Run /2fa/setup first' });

    const valid = authenticator.check(code, user.twoFactorSecret);
    if (!valid) return res.status(400).json({ message: 'Invalid code' });

    // Generate 8 backup codes
    const rawCodes: string[] = [];
    const hashedCodes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const raw = Math.random().toString(36).slice(2, 10).toUpperCase();
      rawCodes.push(raw);
      hashedCodes.push(await bcrypt.hash(raw, 10));
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: true } }),
      prisma.twoFactorBackupCode.deleteMany({ where: { userId } }),
      ...hashedCodes.map(code => prisma.twoFactorBackupCode.create({ data: { userId, code } })),
    ]);

    res.json({ message: '2FA enabled', backupCodes: rawCodes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── 2FA DISABLE ───────────────────────────────────────────────────────────

router.post('/2fa/disable', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const { code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled) return res.status(400).json({ message: '2FA is not enabled' });

    const valid = authenticator.check(code, user.twoFactorSecret!);
    if (!valid) return res.status(400).json({ message: 'Invalid code' });

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false, twoFactorSecret: null } }),
      prisma.twoFactorBackupCode.deleteMany({ where: { userId } }),
    ]);

    res.json({ message: '2FA disabled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── SOCIAL LOGIN ──────────────────────────────────────────────────────────

router.post('/social', async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, name, provider } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { email, name: name || `${provider} User`, role: 'BUYER', verified: true },
      });
    }
    const { accessToken, refreshToken } = await issueTokens(user.id, user.role, req);
    await logLogin(user.id, req, 'SUCCESS');
    res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── OAUTH CALLBACKS (Passport) ───────────────────────────────────────────

import passport from 'passport';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }), async (req: any, res: Response) => {
  const { accessToken, refreshToken } = await issueTokens(req.user.id, req.user.role, req);
  await logLogin(req.user.id, req, 'SUCCESS');
  const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
  res.redirect(`${FRONTEND_URL}/login?token=${accessToken}&refresh=${refreshToken}&user=${userStr}`);
});

router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
router.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }), async (req: any, res: Response) => {
  const { accessToken, refreshToken } = await issueTokens(req.user.id, req.user.role, req);
  await logLogin(req.user.id, req, 'SUCCESS');
  const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
  res.redirect(`${FRONTEND_URL}/login?token=${accessToken}&refresh=${refreshToken}&user=${userStr}`);
});

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'], session: false }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed` }), async (req: any, res: Response) => {
  const { accessToken, refreshToken } = await issueTokens(req.user.id, req.user.role, req);
  const userStr = encodeURIComponent(JSON.stringify({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role }));
  res.redirect(`${FRONTEND_URL}/login?token=${accessToken}&refresh=${refreshToken}&user=${userStr}`);
});

// Generic fallback
router.get('/:provider', (req: Request, res: Response) => {
  res.redirect(`${FRONTEND_URL}/login?error=provider_not_configured`);
});

// ── THEME ─────────────────────────────────────────────────────────────────

router.get('/theme', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const theme = await prisma.themePreference.findUnique({ where: { userId } });
    res.json({ theme });
  } catch { res.status(500).json({ message: 'Error fetching theme' }); }
});

router.post('/theme', requireAuth, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = String((req as any).user.id);
    const { name, mode, primary, secondary, accent, background, cardStyle, borderStyle } = req.body;
    const theme = await prisma.themePreference.upsert({
      where:  { userId },
      update: { themeName: name, mode, primary, secondary, accent, background, cardStyle, borderStyle },
      create: { userId, themeName: name, mode, primary, secondary, accent, background, cardStyle, borderStyle },
    });
    res.json({ theme });
  } catch { res.status(500).json({ message: 'Error saving theme' }); }
});

export default router;
