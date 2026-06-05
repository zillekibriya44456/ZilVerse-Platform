import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Reusable function to get the current logged-in user in Next.js Server Components.
 * Uses Better Auth's getSession which securely reads the httpOnly cookie.
 */
export async function getCurrentUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return session.user;
}
