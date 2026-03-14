import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { z } from "zod";

export const authSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export type AuthInput = z.infer<typeof authSchema>;

export class AuthService {
    static async register(data: AuthInput) {
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error("Email already in use");
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(data.password, salt);

        // Create user and portfolio together
        const user = await prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
                portfolio: {
                    create: {
                        cash: 10000,
                    },
                },
            },
        });

        return this.generateToken(user.id, user.email);
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

        return this.generateToken(user.id, user.email);
    }

    static async getMe(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
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

    private static generateToken(userId: number, email: string) {
        const payload = { userId, email };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET environment variable is not defined");
        }
        return jwt.sign(payload, secret, { expiresIn: "7d" });
    }
}
