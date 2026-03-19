import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';
import jwt from 'jsonwebtoken';

describe('PokemonCard API', () => {
  const secret = process.env.JWT_SECRET || 'secret';
  const validToken = jwt.sign({ id: 1, email: 'test@test.com' }, secret);
  const mockPika = { id: 1, name: 'Pikachu', pokedexId: 25, typeId: 1, lifePoints: 35 };

  it('GET /pokemons-cards - Succès', async () => {
    (prismaMock.pokemonCard.findMany as jest.Mock).mockResolvedValue([mockPika]);
    const res = await request(app).get('/pokemons-cards');
    expect(res.status).toBe(200);
  });

  it('GET /pokemons-cards/:id - 404 si inexistant', async () => {
    (prismaMock.pokemonCard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app).get('/pokemons-cards/999');
    expect(res.status).toBe(404);
  });

  it('POST /pokemons-cards - 400 si données manquantes', async () => {
    const res = await request(app)
      .post('/pokemons-cards')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: '' });
    expect(res.status).toBe(400);
  });

  it('PATCH /pokemons-cards/:id - 404 si inexistant', async () => {
    (prismaMock.pokemonCard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .patch('/pokemons-cards/1')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ name: 'New' });
    expect(res.status).toBe(404);
  });

  it('DELETE /pokemons-cards/:id - 404 si inexistant', async () => {
    (prismaMock.pokemonCard.findUnique as jest.Mock).mockResolvedValue(null);
    const res = await request(app)
      .delete('/pokemons-cards/1')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(404);
  });

  it('Auth - 401 si token invalide', async () => {
    const res = await request(app)
      .post('/pokemons-cards')
      .set('Authorization', 'Bearer mauvais-token');
    expect(res.status).toBe(401);
  });
});