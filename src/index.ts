import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { getAllPokemons, getPokemonById, createPokemon, updatePokemon, deletePokemon } from './controllers/pokemon.controller';

import { register, login } from './controllers/user.controller';
import { authMiddleware } from './middlewares/auth.middleware';

export const app = express();
const port = process.env.PORT || 3000;

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.post('/users', register);
app.post('/users/login', login);

app.get('/pokemons-cards', getAllPokemons);
app.get('/pokemons-cards/:pokemonCardId', getPokemonById);


app.post('/pokemons-cards', authMiddleware, createPokemon);
app.patch('/pokemons-cards/:pokemonCardId', authMiddleware, updatePokemon);
app.delete('/pokemons-cards/:pokemonCardId', authMiddleware, deletePokemon);

export const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export function stopServer() {
  server.close();
}