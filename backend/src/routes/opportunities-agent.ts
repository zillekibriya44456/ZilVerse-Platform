import express, { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// ─── Skill-based scoring helper ────────────────────────────────────────────
function scoreMatch(userSkills: string[], targetText: string): number {
  if (!userSkills.length || !targetText) return 0;
  const text = targetText.toLowerCase();
  let matches = 0;
  for (const skill of userSkills) {
    if (text.includes(skill.toLowerCase())) matches++;
  }
  return Math.round((matches / Math.max(userSkills.length, 1)) * 100);
}

function parseSkills(skillStr: string | null | undefined): string[] {
  if (!skillStr) return [];
  try {
    const parsed = JSON.parse(skillStr);
    if (Array.isArray(parsed)) return parsed.map((s: string) => s.toLowerCase().trim());
  } catch {}
  return skillStr.split(',').map(s => s.toLowerCase().trim()).filter(Boolean);
}

// ─── GET /api/agent/opportunities ────────────────────────────────────────────
// Returns personalized ranked opportunities for the authenticated user
router.get('/opportunities', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const userId = req.user.id;

    // Load user profile + freelancer profile for skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        freelancerProfile: true,
        jobApplications: { select: { jobId: true } },
      },
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const userSkills  = parseSkills(user.freelancerProfile?.skills);
    const userRole    = (user.role || 'USER').toLowerCase();
    const appliedIds  = new Set(user.jobApplications.map(a => a.jobId));

    // ── 1. Jobs ──────────────────────────────────────────────────────────────
    const [allJobs, allEvents, allGrantsRaw, allFreelancers] = await Promise.all([
      prisma.job.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: { employer: { select: { name: true, avatar: true } } },
      }),
      prisma.event.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.fundGrant.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: { creator: { select: { name: true, avatar: true } } },
      }),
      prisma.freelancerProfile.findMany({
        take: 50,
        where: { userId: { not: userId } },
        include: { user: { select: { id: true, name: true, avatar: true } } },
      }),
    ]);

    // Score & sort jobs
    const jobs = allJobs
      .filter(j => !appliedIds.has(j.id))
      .map(j => ({
        ...j,
        matchScore: scoreMatch(userSkills, `${j.title} ${j.description} ${j.requirements}`),
        type: 'job',
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    // Score & sort internships (type filter)
    const internships = allJobs
      .filter(j => j.type?.toLowerCase().includes('intern') && !appliedIds.has(j.id))
      .map(j => ({
        ...j,
        matchScore: scoreMatch(userSkills, `${j.title} ${j.description} ${j.requirements}`),
        type: 'internship',
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // Score & sort events
    const events = allEvents
      .map(e => ({
        ...e,
        matchScore: scoreMatch(userSkills, `${e.title} ${e.description || ''} ${e.category || ''}`),
        type: 'event',
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // Score grants (relevant for founders/researchers)
    const grants = allGrantsRaw
      .map(g => ({
        ...g,
        matchScore: userRole === 'freelancer' || userRole === 'user'
          ? scoreMatch(userSkills, `${g.title} ${g.description}`)
          : 80,
        type: 'grant',
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // Score collaborators (freelancers with complementary skills)
    const collaborators = allFreelancers
      .map(f => {
        const fSkills = parseSkills(f.skills);
        // Complementary = low overlap but same domain
        const overlap = fSkills.filter(s => userSkills.includes(s)).length;
        const score = Math.max(0, 70 - overlap * 10); // complement score
        return {
          id: f.id,
          userId: f.userId,
          name: f.user.name,
          avatar: f.user.avatar,
          title: f.title,
          skills: fSkills.slice(0, 5),
          hourlyRate: f.hourlyRate,
          matchScore: score,
          type: 'collaborator',
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    // ── Summary stats ─────────────────────────────────────────────────────
    const summary = {
      totalOpportunities: jobs.length + internships.length + events.length + grants.length,
      topMatchScore: Math.max(...jobs.map(j => j.matchScore), 0),
      userSkillsCount: userSkills.length,
      lastUpdated: new Date().toISOString(),
    };

    return res.json({
      summary,
      jobs,
      internships,
      events,
      grants,
      collaborators,
    });
  } catch (error) {
    console.error('[Agent] Error:', error);
    return res.status(500).json({ message: 'Agent failed to fetch opportunities' });
  }
});

// ─── GET /api/agent/quick-stats ───────────────────────────────────────────
router.get('/quick-stats', requireAuth, async (req: any, res: Response): Promise<any> => {
  try {
    const [jobs, events, grants, freelancers] = await Promise.all([
      prisma.job.count(),
      prisma.event.count(),
      prisma.fundGrant.count(),
      prisma.freelancerProfile.count(),
    ]);
    return res.json({ jobs, events, grants, freelancers });
  } catch {
    return res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

export default router;
