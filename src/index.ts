import express from 'express';
import { getAllPokemons, getPokemonById, createPokemon, updatePokemon, deletePokemon } from './controllers/pokemon.controller';

export const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

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