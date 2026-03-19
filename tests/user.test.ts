import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

describe('User API', () => {
  const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword' };

  it('POST /users - 400 si données invalides', async () => {
    const res = await request(app).post('/users').send({ email: '' });
    expect(res.status).toBe(400);
  });

  it('POST /users - Succès', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prismaMock.user.create as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app).post('/users').send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(201);
  });

  it('POST /users - 400 si email déjà utilisé', async () => {
    (prismaMock.user.create as jest.Mock).mockRejectedValue(new Error('Email déjà utilisé'));
    const res = await request(app).post('/users').send({ email: 'test@test.com', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('POST /users/login - 404 utilisateur non trouvé', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).post('/users/login').send({ email: 'fake@t.fr', password: '123' });
    expect(res.status).toBe(404);
  });

  it('POST /users/login - 400 mauvais mot de passe', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app).post('/users/login').send({ email: 'test@test.com', password: 'wrong' });
    expect(res.status).toBe(400);
  });

  it('POST /users/login - Succès', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app).post('/users/login').send({ email: 'test@test.com', password: 'truePassword' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
  });
});