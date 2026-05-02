import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export interface AuthUser {
  id: string;
  username: string;
  roles: string[];
  prodiId?: number | null;
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;

    // Enrich token with prodiId from database when available
    try {
      const userId = Number(decoded.id);
      if (!Number.isNaN(userId)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { prodiId: true },
        });
        return { ...decoded, prodiId: dbUser?.prodiId ?? null };
      }
    } catch (e) {
      // ignore DB errors and return decoded token as fallback
    }

    return decoded;
  } catch (error) {
    return null;
  }
}
