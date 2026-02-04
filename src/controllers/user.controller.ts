import { Request, Response } from 'express';
import prisma from '../client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  const isPlainValid = password === user.password;

  if (!isPasswordValid && !isPlainValid) {
    return res.status(401).json({ message: 'Identifiants invalides' });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );

  res.status(200).json({ token });
};