import { Request, Response } from 'express';
import prisma from '../client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Un champs requis est vide' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(400).json({ message: "L'email est déjà utilisé" });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(404).json({ message: "L'utilisateur n'existe pas en base de données" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Le mot de passe ne correspond pas à l'utilisateur" });
    }

    const secret = process.env.JWT_SECRET || 'secret_par_defaut';
    const expires = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        secret,
        { expiresIn: expires as any }
    );

    res.status(201).json({ token, message: 'Connexion réussie' });
};

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
        select: { id: true, email: true },
    });
    res.status(200).json(users);
};

export const getUserById = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId as string) },
        select: { id: true, email: true },
    });

    if (!user) {
        return res.status(404).json({ message: "L'utilisateur n'existe pas" });
    }

    res.status(200).json(user);
};

export const updateUser = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId as string) },
    });

    if (!user) {
        return res.status(404).json({ message: "L'utilisateur n'existe pas" });
    }

    const data: any = {};
    if (email) data.email = email;
    if (password) data.password = await bcrypt.hash(password, 10);

    try {
        const updated = await prisma.user.update({
            where: { id: parseInt(userId as string) },
            data,
            select: { id: true, email: true },
        });
        res.status(200).json(updated);
    } catch (error) {
        res.status(400).json({ message: "L'email est déjà utilisé" });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
        where: { id: parseInt(userId as string) },
    });

    if (!user) {
        return res.status(404).json({ message: "L'utilisateur n'existe pas" });
    }

    await prisma.user.delete({
        where: { id: parseInt(userId as string) },
    });

    res.status(204).send();
};