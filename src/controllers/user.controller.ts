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
        // On ne renvoie pas le password dans la réponse
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
        return res.status(400).json({ message: 'Le mot de passe ne correspond pas à l\'utilisateur' });
    }

    const secret = process.env.JWT_SECRET || 'secret_par_defaut';
    const expires = process.env.JWT_EXPIRES_IN || '1d';

    const token = jwt.sign(
        { userId: user.id, email: user.email },
        secret,
        { expiresIn: expires as any } // Le "as any" règle le conflit de type sur expires
    );

    res.status(201).json({
        token,
        message: 'Connexion réussie',
    });
};