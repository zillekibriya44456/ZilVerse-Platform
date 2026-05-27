"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const passport_github2_1 = require("passport-github2");
const passport_facebook_1 = require("passport-facebook");
const passport_oauth2_1 = require("passport-oauth2");
const axios_1 = __importDefault(require("axios"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const handleSocialProfile = async (profile, provider, done) => {
    try {
        const email = profile.emails?.[0]?.value || `${profile.id}@${provider}.local`;
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(Math.random().toString(36).slice(-8), salt);
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
    }
    catch (error) {
        return done(error, null);
    }
};
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_secret',
    callbackURL: 'http://localhost:5002/api/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => handleSocialProfile(profile, 'google', done)));
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'dummy_github_client_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_github_secret',
    callbackURL: 'http://localhost:5002/api/auth/github/callback',
}, (accessToken, refreshToken, profile, done) => handleSocialProfile(profile, 'github', done)));
passport_1.default.use(new passport_facebook_1.Strategy({
    clientID: process.env.FACEBOOK_CLIENT_ID || 'dummy_facebook_client_id',
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET || 'dummy_facebook_secret',
    callbackURL: 'http://localhost:5002/api/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails']
}, (accessToken, refreshToken, profile, done) => handleSocialProfile(profile, 'facebook', done)));
const linkedInStrategy = new passport_oauth2_1.Strategy({
    authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
    clientID: process.env.LINKEDIN_CLIENT_ID || 'dummy_linkedin_client_id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'dummy_linkedin_secret',
    callbackURL: 'http://localhost:5002/api/auth/linkedin/callback',
    scope: ['openid', 'profile', 'email'],
    state: true,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Fetch user profile from the new OIDC userinfo endpoint
        const { data } = await axios_1.default.get('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        // Map OIDC profile to standard passport profile
        const mappedProfile = {
            id: data.sub,
            displayName: data.name,
            emails: [{ value: data.email }],
        };
        return handleSocialProfile(mappedProfile, 'linkedin', done);
    }
    catch (err) {
        return done(err, null);
    }
});
linkedInStrategy.name = 'linkedin';
passport_1.default.use(linkedInStrategy);
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
//# sourceMappingURL=passport.js.map