import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { getAllPokemons, getPokemonById, createPokemon, updatePokemon, deletePokemon } from './controllers/pokemon.controller';

export const app = express();
const port = process.env.PORT || 3000;

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/pokemons-cards', getAllPokemons);
app.get('/pokemons-cards/:pokemonCardId', getPokemonById);
app.post('/pokemons-cards', createPokemon);
app.patch('/pokemons-cards/:pokemonCardId', updatePokemon);
app.delete('/pokemons-cards/:pokemonCardId', deletePokemon);

export const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export function stopServer() {
  server.close();
}