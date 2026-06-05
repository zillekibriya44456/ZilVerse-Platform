import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as OAuth2Strategy } from 'passport-oauth2';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const handleSocialProfile = async (profile: any, provider: string, done: any) => {
  try {
    const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.local`;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), salt);
      user = await prisma.user.create({
        data: {
          email,
          name: profile.displayName || profile.username || `${provider} User`,
          password: hashedPassword,
          role: 'BUYER',
        },
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5002/api/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => handleSocialProfile(profile, 'google', done)
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy_github_client_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_github_secret',
      callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5002/api/auth/github/callback',
    },
    (accessToken: any, refreshToken: any, profile: any, done: any) => handleSocialProfile(profile, 'github', done)
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID || 'dummy_facebook_client_id',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy_facebook_secret',
      callbackURL: process.env.FACEBOOK_CALLBACK_URL || 'http://localhost:5002/api/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'emails']
    },
    (accessToken: any, refreshToken: any, profile: any, done: any) => handleSocialProfile(profile, 'facebook', done)
  )
);

const linkedInStrategy = new OAuth2Strategy(
  {
    authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientID: process.env.LINKEDIN_CLIENT_ID || 'dummy_linkedin_client_id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'dummy_linkedin_secret',
    callbackURL: process.env.LINKEDIN_CALLBACK_URL || 'http://localhost:5002/api/auth/linkedin/callback',
    scope: ['openid', 'profile', 'email'],
    state: true,
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // Fetch user profile from the new OIDC userinfo endpoint
      const { data } = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Map OIDC profile to standard passport profile
      const mappedProfile = {
        id: data.sub,
        displayName: data.name,
        emails: [{ value: data.email }],
      };
      return handleSocialProfile(mappedProfile, 'linkedin', done);
    } catch (err) {
      return done(err, null);
    }
  }
);
linkedInStrategy.name = 'linkedin';
passport.use(linkedInStrategy);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
