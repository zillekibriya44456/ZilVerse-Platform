import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql", 
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
    account: {
        accountLinking: {
            enabled: true,
            trustedProviders: ["google"],
        }
    },
    user: {
        additionalFields: {
            role: { type: "string", required: false, defaultValue: "STUDENT" },
            profession: { type: "string", required: false },
            countryCode: { type: "string", required: false },
            stateName: { type: "string", required: false },
            phoneDial: { type: "string", required: false },
            phoneNum: { type: "string", required: false },
        }
    }
});
