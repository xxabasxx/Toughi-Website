import { getSessionUser } from "@/lib/auth";
import type { User } from "@/db/schema";

const ADMIN_PHONES = new Set(
  (process.env.ADMIN_PHONES ?? "09121112233")
    .split(",")
    .map((p) => p.replace(/[^0-9]/g, ""))
    .filter(Boolean),
);

export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  const phone = user.phone.replace(/[^0-9]/g, "");
  return ADMIN_PHONES.has(phone) || ADMIN_PHONES.has("0" + phone.replace(/^0*/, ""));
}

export async function requireAdmin(): Promise<User> {
  const user = await getSessionUser();
  if (!isAdmin(user)) {
    throw new Error("FORBIDDEN");
  }
  return user as User;
}
