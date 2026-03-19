import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';

describe('User API', () => {
  const mockUser = { id: 1, email: 'test@test.com', password: 'hashedPassword' };
  const mockUserPublic = { id: 1, email: 'test@test.com' };
  const validToken = 'mockedToken';

  it('POST /users - 400 si données invalides', async () => {
    const res = await request(app).post('/users').send({ email: '' });
    expect(res.status).toBe(400);
  });

  it('POST /users - Succès', async () => {
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

  it('GET /users - Succès', async () => {
    (prismaMock.user.findMany as jest.Mock).mockResolvedValue([mockUserPublic]);
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /users/:id - Succès', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUserPublic);
    const res = await request(app)
      .get('/users/1')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
  });

  it('GET /users/:id - 404 si inexistant', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .get('/users/999')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(404);
  });

  it('PATCH /users/:id - Succès avec email', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prismaMock.user.update as jest.Mock).mockResolvedValue(mockUserPublic);
    const res = await request(app)
      .patch('/users/1')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ email: 'new@test.com' });
    expect(res.status).toBe(200);
  });

  it('PATCH /users/:id - Succès avec password', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prismaMock.user.update as jest.Mock).mockResolvedValue(mockUserPublic);
    const res = await request(app)
      .patch('/users/1')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ password: 'newPassword123' });
    expect(res.status).toBe(200);
  });

  it('PATCH /users/:id - 404 si inexistant', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .patch('/users/999')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ email: 'new@test.com' });
    expect(res.status).toBe(404);
  });

  it('PATCH /users/:id - 400 si email déjà utilisé', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prismaMock.user.update as jest.Mock).mockRejectedValue(new Error('Email déjà utilisé'));
    const res = await request(app)
      .patch('/users/1')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ email: 'existing@test.com' });
    expect(res.status).toBe(400);
  });

  it('DELETE /users/:id - Succès', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (prismaMock.user.delete as jest.Mock).mockResolvedValue(mockUser);
    const res = await request(app)
      .delete('/users/1')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /users/:id - 404 si inexistant', async () => {
    (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .delete('/users/999')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(404);
  });
});