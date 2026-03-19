import 'dotenv/config';
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { getAllPokemons, getPokemonById, createPokemon, updatePokemon, deletePokemon } from './controllers/pokemon.controller';
import { register, login, getAllUsers, getUserById, updateUser, deleteUser } from './controllers/user.controller';
import { authMiddleware } from './middlewares/auth.middleware';

export const app = express();

/* istanbul ignore next */
const port = process.env.NODE_ENV === 'test' ? 0 : (process.env.PORT || 3000);

app.use(express.json());

/* istanbul ignore next */
try {
  const swaggerPath = path.join(__dirname, '../swagger.yaml');
  const swaggerDocument = YAML.load(swaggerPath);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.error("Erreur de chargement du fichier swagger.yaml");
}

app.post('/users', register);
app.post('/users/login', login);
app.get('/users', authMiddleware, getAllUsers);
app.get('/users/:userId', authMiddleware, getUserById);
app.patch('/users/:userId', authMiddleware, updateUser);
app.delete('/users/:userId', authMiddleware, deleteUser);

app.get('/pokemons-cards', getAllPokemons);
app.get('/pokemons-cards/:pokemonCardId', getPokemonById);

app.post('/pokemons-cards', authMiddleware, createPokemon);
app.patch('/pokemons-cards/:pokemonCardId', authMiddleware, updatePokemon);
app.delete('/pokemons-cards/:pokemonCardId', authMiddleware, deletePokemon);

/* istanbul ignore next */
export const server = app.listen(port, () => {
  console.log(`Serveur démarré`);
  console.log(`URL : http://localhost:${port}`);
});

export function stopServer() {
  server.close();
}