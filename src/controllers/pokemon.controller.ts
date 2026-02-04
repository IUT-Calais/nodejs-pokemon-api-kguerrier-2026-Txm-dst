import { Request, Response } from 'express';
import prisma from '../client';

export const getAllPokemons = async (req: Request, res: Response) => {
  const pokemons = await prisma.pokemonCard.findMany({
    include: {
      type: true
    }
  });
  res.status(200).json(pokemons);
};

export const getPokemonById = async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;
  const pokemon = await prisma.pokemonCard.findUnique({
    where: { id: parseInt(pokemonCardId) },
    include: { type: true }
  });

  if (!pokemon) {
    return res.status(404).json({ message: "L'id renseigné n'existe pas" });
  }
  res.status(200).json(pokemon);
};

export const createPokemon = async (req: Request, res: Response) => {
  const { name, pokedexId, typeId, lifePoints, size, weight, imageUrl } = req.body;

  if (!name || !pokedexId || !typeId || !lifePoints) {
    return res.status(400).json({ message: 'Champs requis vides' });
  }

  try {
    const newPokemon = await prisma.pokemonCard.create({
      data: {
        name,
        pokedexId,
        typeId,
        lifePoints,
        size,
        weight,
        imageUrl
      }
    });
    res.status(201).json(newPokemon);
  } catch (error) {
    res.status(400).json({ message: 'Doublon de données ou type inexistant' });
  }
};

export const updatePokemon = async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;
  
  try {
    const updated = await prisma.pokemonCard.update({
      where: { id: parseInt(pokemonCardId) },
      data: req.body
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(404).json({ message: "L'id renseigné n'existe pas" });
  }
};

export const deletePokemon = async (req: Request, res: Response) => {
  const { pokemonCardId } = req.params;

  try {
    await prisma.pokemonCard.delete({
      where: { id: parseInt(pokemonCardId) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ message: "L'id renseigné n'existe pas" });
  }
};