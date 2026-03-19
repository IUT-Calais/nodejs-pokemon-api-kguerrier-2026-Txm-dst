import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

describe('User API', () => {
  describe('POST /users', () => {
    it('should create a new user', async () => {
      const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword' };
      // Simulation de la création Prisma
      (prismaMock.user.create as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/users')
        .send({ email: 'test@test.com', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@test.com');
      // On vérifie que le mot de passe n'est PAS renvoyé (sécurité)
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/users')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Un champs requis est vide');
    });
  });

  describe('POST /users/login', () => {
    it('should login a user and return a token', async () => {
      const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword' };
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/users/login')
        .send({ email: 'test@test.com', password: 'truePassword' }); // 'truePassword' déclenche le succès dans ton jest.setup

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.token).toBe('mockedToken');
    });

    it('should return 404 if user does not exist', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/users/login')
        .send({ email: 'unknown@test.com', password: 'password' });

      expect(status).toBe(404);
    });
  });
});