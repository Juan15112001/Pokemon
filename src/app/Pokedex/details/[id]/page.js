"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';

const PokemonDetails = () => {
  const { id } = useParams();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const fetchPokemonDetails = async () => {
      try {
        setLoading(true);
        // Obtener información básica del Pokémon
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        const data = await response.json();

        // Obtener información de especie para evoluciones y descripción
        const speciesResponse = await fetch(data.species.url);
        const speciesData = await speciesResponse.json();

        // Obtener información de cadena de evolución
        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        const evolutionData = await evolutionResponse.json();

        // Obtener información de movimientos
        const movesPromises = data.moves.map(move => 
          fetch(move.move.url).then(res => res.json())
        );
        const movesData = await Promise.all(movesPromises);

        // Obtener información de habilidades
        const abilitiesPromises = data.abilities.map(ability => 
          fetch(ability.ability.url).then(res => res.json())
        );
        const abilitiesData = await Promise.all(abilitiesPromises);

        // Obtener información de tipos
        const typesPromises = data.types.map(type => 
          fetch(type.type.url).then(res => res.json())
        );
        const typesData = await Promise.all(typesPromises);

        // Procesar la cadena de evolución
        const processEvolutionChain = (chain) => {
          const evolutions = [];
          let current = chain;
          
          while (current) {
            evolutions.push({
              name: current.species.name,
              id: current.species.url.split('/').slice(-2, -1)[0],
              trigger: current.evolution_details[0]?.trigger?.name || 'level-up',
              level: current.evolution_details[0]?.min_level || null,
              item: current.evolution_details[0]?.item?.name || null,
              min_happiness: current.evolution_details[0]?.min_happiness || null,
              min_affection: current.evolution_details[0]?.min_affection || null,
              time_of_day: current.evolution_details[0]?.time_of_day || null,
              gender: current.evolution_details[0]?.gender || null,
              held_item: current.evolution_details[0]?.held_item?.name || null,
              known_move: current.evolution_details[0]?.known_move?.name || null,
              known_move_type: current.evolution_details[0]?.known_move_type?.name || null,
              location: current.evolution_details[0]?.location?.name || null,
              needs_overworld_rain: current.evolution_details[0]?.needs_overworld_rain || false,
              party_species: current.evolution_details[0]?.party_species?.name || null,
              party_type: current.evolution_details[0]?.party_type?.name || null,
              relative_physical_stats: current.evolution_details[0]?.relative_physical_stats || null,
              turn_upside_down: current.evolution_details[0]?.turn_upside_down || false,
            });
            current = current.evolves_to[0];
          }
          
          return evolutions;
        };

        const pokemonData = {
          id: data.id,
          name: data.name,
          types: data.types.map(type => ({
            name: type.type.name,
            damage_relations: typesData.find(t => t.name === type.type.name)?.damage_relations || {},
          })),
          stats: data.stats.map(stat => ({
            name: stat.stat.name,
            value: stat.base_stat,
            effort: stat.effort,
          })),
          abilities: data.abilities.map((ability, index) => ({
            name: ability.ability.name,
            is_hidden: ability.is_hidden,
            slot: ability.slot,
            effect: abilitiesData[index]?.effect_entries.find(e => e.language.name === 'es')?.effect || 'No hay descripción disponible',
            short_effect: abilitiesData[index]?.effect_entries.find(e => e.language.name === 'es')?.short_effect || 'No hay descripción disponible',
          })),
          moves: movesData.map(move => ({
            name: move.name,
            type: move.type.name,
            power: move.power,
            accuracy: move.accuracy,
            pp: move.pp,
            priority: move.priority,
            damage_class: move.damage_class.name,
            effect_chance: move.effect_chance,
            effect_entries: move.effect_entries.find(e => e.language.name === 'es')?.effect || 'No hay descripción disponible',
            short_effect: move.effect_entries.find(e => e.language.name === 'es')?.short_effect || 'No hay descripción disponible',
            learned_by_pokemon: move.learned_by_pokemon.map(p => p.name),
            flavor_text_entries: move.flavor_text_entries.find(e => e.language.name === 'es')?.flavor_text || 'No hay descripción disponible',
          })),
          height: data.height / 10, // Convertir a metros
          weight: data.weight / 10, // Convertir a kg
          base_experience: data.base_experience,
          sprites: {
            front_default: data.sprites.front_default,
            front_shiny: data.sprites.front_shiny,
            back_default: data.sprites.back_default,
            back_shiny: data.sprites.back_shiny,
            female: data.sprites.front_female,
            female_shiny: data.sprites.front_shiny_female,
            other: {
              'official-artwork': data.sprites.other['official-artwork'].front_default,
              dream_world: data.sprites.other.dream_world.front_default,
              home: data.sprites.other.home.front_default,
            },
          },
          cries: {
            latest: data.cries.latest,
            legacy: data.cries.legacy,
          },
          species: {
            name: speciesData.name,
            description: speciesData.flavor_text_entries.find(
              entry => entry.language.name === 'es'
            )?.flavor_text || 'No hay descripción disponible',
            gender_rate: speciesData.gender_rate,
            capture_rate: speciesData.capture_rate,
            base_happiness: speciesData.base_happiness,
            growth_rate: speciesData.growth_rate.name,
            habitat: speciesData.habitat?.name || 'Desconocido',
            generation: speciesData.generation.name,
            egg_groups: speciesData.egg_groups.map(group => group.name),
            shape: speciesData.shape?.name || 'Desconocido',
            color: speciesData.color?.name || 'Desconocido',
            evolution_chain: speciesData.evolution_chain.url,
            varieties: speciesData.varieties.map(variety => ({
              is_default: variety.is_default,
              pokemon: variety.pokemon.name,
            })),
          },
          evolutions: processEvolutionChain(evolutionData.chain),
        };

        setPokemon(pokemonData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Pokémon details:', error);
        setError('Error al cargar los detalles del Pokémon');
        setLoading(false);
      }
    };

    fetchPokemonDetails();
  }, [id]);

  const playCry = () => {
    if (pokemon?.cries?.latest) {
      const newAudio = new Audio(pokemon.cries.latest);
      newAudio.play();
      setAudio(newAudio);
      setIsPlaying(true);
      newAudio.onended = () => setIsPlaying(false);
    }
  };

  const stopCry = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <Loader className="animate-spin text-yellow-300" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="bg-red-800 text-white p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!pokemon) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-blue-900 to-purple-900 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Botón de regreso */}
        <Link href="/Pokedex" className="inline-flex items-center text-white mb-4 sm:mb-6 hover:text-yellow-300 transition-colors">
          <ArrowLeft className="mr-2" />
          Volver a la Pokédex
        </Link>

        {/* Encabezado */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6">
            {/* Imágenes */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full md:w-auto">
              <div className="bg-gray-800 rounded-lg p-2 sm:p-4">
                <img 
                  src={pokemon.sprites.front_default} 
                  alt={`${pokemon.name} normal`}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                />
                <p className="text-center text-white mt-2 text-sm sm:text-base">Normal</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 sm:p-4">
                <img 
                  src={pokemon.sprites.front_shiny} 
                  alt={`${pokemon.name} shiny`}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                />
                <p className="text-center text-white mt-2 text-sm sm:text-base">Shiny</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 sm:p-4">
                <img 
                  src={pokemon.sprites.other['official-artwork']} 
                  alt={`${pokemon.name} artwork`}
                  className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                />
                <p className="text-center text-white mt-2 text-sm sm:text-base">Arte Oficial</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-2 sm:p-4">
                <button
                  onClick={isPlaying ? stopCry : playCry}
                  className="w-full h-24 sm:h-32 flex items-center justify-center"
                >
                  {isPlaying ? (
                    <VolumeX className="text-white" size={24} />
                  ) : (
                    <Volume2 className="text-white" size={24} />
                  )}
                </button>
                <p className="text-center text-white mt-2 text-sm sm:text-base">Chillido</p>
              </div>
            </div>

            {/* Información básica */}
            <div className="flex-1 w-full mt-4 md:mt-0">
              <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 capitalize">
                {pokemon.name}
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-4">#{pokemon.id.toString().padStart(3, '0')}</p>
              
              {/* Tipos */}
              <div className="flex flex-wrap gap-2 mb-4">
                {pokemon.types.map((type, index) => (
                  <span 
                    key={index}
                    className="px-3 sm:px-4 py-1 rounded-full text-white bg-gray-800 capitalize text-sm sm:text-base"
                  >
                    {type.name}
                  </span>
                ))}
              </div>

              {/* Estadísticas básicas */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-400 text-sm sm:text-base">Altura</p>
                  <p className="text-white text-sm sm:text-base">{pokemon.height} m</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-400 text-sm sm:text-base">Peso</p>
                  <p className="text-white text-sm sm:text-base">{pokemon.weight} kg</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-400 text-sm sm:text-base">Experiencia Base</p>
                  <p className="text-white text-sm sm:text-base">{pokemon.base_experience}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-400 text-sm sm:text-base">Tasa de Captura</p>
                  <p className="text-white text-sm sm:text-base">{pokemon.species.capture_rate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6">
          <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'info' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'stats' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Estadísticas
            </button>
            <button
              onClick={() => setActiveTab('moves')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'moves' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Movimientos
            </button>
            <button
              onClick={() => setActiveTab('abilities')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'abilities' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Habilidades
            </button>
            <button
              onClick={() => setActiveTab('evolution')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'evolution' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Evoluciones
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
                activeTab === 'types' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Tipos
            </button>
          </div>

          {/* Contenido de las pestañas */}
          <div className="text-white">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Descripción</h3>
                  <p className="text-sm sm:text-base">{pokemon.species.description}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Hábitat</h3>
                    <p className="capitalize text-sm sm:text-base">{pokemon.species.habitat}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Tasa de Captura</h3>
                    <p className="text-sm sm:text-base">{pokemon.species.capture_rate}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Generación</h3>
                    <p className="capitalize text-sm sm:text-base">{pokemon.species.generation}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Grupos de Huevo</h3>
                    <div className="flex flex-wrap gap-2">
                      {pokemon.species.egg_groups.map((group, index) => (
                        <span key={index} className="capitalize bg-gray-700 px-2 py-1 rounded text-sm sm:text-base">
                          {group}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Forma</h3>
                    <p className="capitalize text-sm sm:text-base">{pokemon.species.shape}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold mb-2">Color</h3>
                    <p className="capitalize text-sm sm:text-base">{pokemon.species.color}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="space-y-4">
                {pokemon.stats.map((stat, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span className="capitalize text-sm sm:text-base">{stat.name}</span>
                      <span className="text-sm sm:text-base">{stat.value}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(stat.value / 255) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      Puntos de esfuerzo: {stat.effort}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'moves' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pokemon.moves.map((move, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold capitalize mb-2">{move.name}</h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs sm:text-sm text-gray-400">Tipo</p>
                        <p className="capitalize text-sm sm:text-base">{move.type}</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs sm:text-sm text-gray-400">Categoría</p>
                        <p className="capitalize text-sm sm:text-base">{move.damage_class}</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs sm:text-sm text-gray-400">Poder</p>
                        <p className="text-sm sm:text-base">{move.power || '-'}</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs sm:text-sm text-gray-400">Precisión</p>
                        <p className="text-sm sm:text-base">{move.accuracy || '-'}</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs sm:text-sm text-gray-400">PP</p>
                        <p className="text-sm sm:text-base">{move.pp}</p>
                      </div>
                      <div className="bg-gray-700 rounded p-2">
                        <p className="text-xs sm:text-sm text-gray-400">Prioridad</p>
                        <p className="text-sm sm:text-base">{move.priority}</p>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-300">{move.flavor_text_entries}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'abilities' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pokemon.abilities.map((ability, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold capitalize mb-2">{ability.name}</h3>
                    {ability.is_hidden && (
                      <span className="inline-block bg-yellow-500 text-white text-xs px-2 py-1 rounded mb-2">
                        Habilidad Oculta
                      </span>
                    )}
                    <p className="text-sm sm:text-base text-gray-300 mb-2">{ability.effect}</p>
                    <p className="text-xs sm:text-sm text-gray-400">{ability.short_effect}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'evolution' && (
              <div className="space-y-6">
                {pokemon.evolutions.map((evo, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <img 
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                        alt={evo.name}
                        className="w-16 h-16 sm:w-24 sm:h-24"
                      />
                      <div className="w-full sm:w-auto">
                        <h3 className="text-lg sm:text-xl font-bold capitalize">{evo.name}</h3>
                        <div className="space-y-1">
                          {evo.trigger === 'level-up' && evo.level && (
                            <p className="text-sm sm:text-base text-gray-400">Nivel {evo.level}</p>
                          )}
                          {evo.item && (
                            <p className="text-sm sm:text-base text-gray-400">Usando {evo.item}</p>
                          )}
                          {evo.min_happiness && (
                            <p className="text-sm sm:text-base text-gray-400">Felicidad mínima: {evo.min_happiness}</p>
                          )}
                          {evo.min_affection && (
                            <p className="text-sm sm:text-base text-gray-400">Afecto mínimo: {evo.min_affection}</p>
                          )}
                          {evo.time_of_day && (
                            <p className="text-sm sm:text-base text-gray-400">Hora del día: {evo.time_of_day}</p>
                          )}
                          {evo.gender && (
                            <p className="text-sm sm:text-base text-gray-400">Género: {evo.gender === 1 ? 'Femenino' : 'Masculino'}</p>
                          )}
                          {evo.held_item && (
                            <p className="text-sm sm:text-base text-gray-400">Objeto sostenido: {evo.held_item}</p>
                          )}
                          {evo.known_move && (
                            <p className="text-sm sm:text-base text-gray-400">Movimiento conocido: {evo.known_move}</p>
                          )}
                          {evo.known_move_type && (
                            <p className="text-sm sm:text-base text-gray-400">Tipo de movimiento conocido: {evo.known_move_type}</p>
                          )}
                          {evo.location && (
                            <p className="text-sm sm:text-base text-gray-400">Ubicación: {evo.location}</p>
                          )}
                          {evo.needs_overworld_rain && (
                            <p className="text-sm sm:text-base text-gray-400">Requiere lluvia en el mundo</p>
                          )}
                          {evo.party_species && (
                            <p className="text-sm sm:text-base text-gray-400">Especie en el equipo: {evo.party_species}</p>
                          )}
                          {evo.party_type && (
                            <p className="text-sm sm:text-base text-gray-400">Tipo en el equipo: {evo.party_type}</p>
                          )}
                          {evo.relative_physical_stats && (
                            <p className="text-sm sm:text-base text-gray-400">Estadísticas relativas: {evo.relative_physical_stats}</p>
                          )}
                          {evo.turn_upside_down && (
                            <p className="text-sm sm:text-base text-gray-400">Requiere girar la consola</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'types' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pokemon.types.map((type, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg sm:text-xl font-bold capitalize mb-4">{type.name}</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2">Doble daño a:</h4>
                        <div className="flex flex-wrap gap-2">
                          {type.damage_relations.double_damage_to?.map((t, i) => (
                            <span key={i} className="bg-gray-700 px-2 sm:px-3 py-1 rounded capitalize text-sm sm:text-base">
                              {t.name}
                            </span>
                          )) || <span className="text-gray-400 text-sm sm:text-base">Ninguno</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2">Mitad de daño a:</h4>
                        <div className="flex flex-wrap gap-2">
                          {type.damage_relations.half_damage_to?.map((t, i) => (
                            <span key={i} className="bg-gray-700 px-2 sm:px-3 py-1 rounded capitalize text-sm sm:text-base">
                              {t.name}
                            </span>
                          )) || <span className="text-gray-400 text-sm sm:text-base">Ninguno</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2">Sin daño a:</h4>
                        <div className="flex flex-wrap gap-2">
                          {type.damage_relations.no_damage_to?.map((t, i) => (
                            <span key={i} className="bg-gray-700 px-2 sm:px-3 py-1 rounded capitalize text-sm sm:text-base">
                              {t.name}
                            </span>
                          )) || <span className="text-gray-400 text-sm sm:text-base">Ninguno</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2">Doble daño de:</h4>
                        <div className="flex flex-wrap gap-2">
                          {type.damage_relations.double_damage_from?.map((t, i) => (
                            <span key={i} className="bg-gray-700 px-2 sm:px-3 py-1 rounded capitalize text-sm sm:text-base">
                              {t.name}
                            </span>
                          )) || <span className="text-gray-400 text-sm sm:text-base">Ninguno</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2">Mitad de daño de:</h4>
                        <div className="flex flex-wrap gap-2">
                          {type.damage_relations.half_damage_from?.map((t, i) => (
                            <span key={i} className="bg-gray-700 px-2 sm:px-3 py-1 rounded capitalize text-sm sm:text-base">
                              {t.name}
                            </span>
                          )) || <span className="text-gray-400 text-sm sm:text-base">Ninguno</span>}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold mb-2">Sin daño de:</h4>
                        <div className="flex flex-wrap gap-2">
                          {type.damage_relations.no_damage_from?.map((t, i) => (
                            <span key={i} className="bg-gray-700 px-2 sm:px-3 py-1 rounded capitalize text-sm sm:text-base">
                              {t.name}
                            </span>
                          )) || <span className="text-gray-400 text-sm sm:text-base">Ninguno</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetails; 