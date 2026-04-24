import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { getJwtSecret } from "../lib/jwtSecret";
import { z } from "zod";

export const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters")
        .max(20, "Username must be at most 20 characters")
        .regex(/^[a-z0-9_-]+$/, "Username can only contain lowercase letters, numbers, underscores, and hyphens"),
});

export type AuthInput = z.infer<typeof authSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export class AuthService {
    static async register(data: RegisterInput) {
        const existingEmail = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingEmail) {
            throw new Error("Email already in use");
        }

        const existingUsername = await prisma.user.findUnique({
            where: { username: data.username },
        });

        if (existingUsername) {
            throw new Error("Username already taken");
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Create user and portfolio together
        const user = await prisma.user.create({
            data: {
                email: data.email,
                username: data.username,
                passwordHash,
                portfolio: {
                    create: {
                        cash: 10000,
                    },
                },
            },
        });

        return this.generateToken(user.id, user.email, user.username);
    }

    static async login(data: AuthInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isMatch = await bcrypt.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw new Error("Invalid credentials");
        }

        return this.generateToken(user.id, user.email, user.username);
    }

    static async getMe(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                portfolio: true,
                settings: true,
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return user;
    }

    static async checkUsernameAvailable(username: string) {
        const existing = await prisma.user.findUnique({
            where: { username },
        });
        return !existing;
    }

    private static generateToken(userId: number, email: string, username?: string | null) {
        const payload = { userId, email, username };
        const secret = getJwtSecret();
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        return jwt.sign(payload, secret, { expiresIn: "7d" });
    }
}
