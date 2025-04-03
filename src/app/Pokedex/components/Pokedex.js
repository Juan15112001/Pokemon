"use client"

import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Loader, Star, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const PokemonGrid = () => {
  const [pokemon, setPokemon] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [shinyStates, setShinyStates] = useState({});
  const [expandedStates, setExpandedStates] = useState({});
  
  const ITEMS_PER_PAGE = 50; // 10 filas de 5 cartas cada una
  
  // Colores para los tipos de Pokémon
  const typeColors = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-600',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-300',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-800',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300',
    // Tipos adicionales
    unknown: 'bg-gray-500',
    shadow: 'bg-gray-700'
  };
  
  // Función para obtener datos de la API de Pokémon
  const fetchPokemon = async () => {
    try {
      setLoading(true);
      // Obtener el conteo total primero
      const countResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
      const countData = await countResponse.json();
      const totalCount = countData.count;
      
      // Obtener todos los Pokémon básicos (solo nombres y URLs)
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${totalCount}`);
      const data = await response.json();
      
      // Calcular el número total de páginas
      setTotalPages(Math.ceil(data.results.length / ITEMS_PER_PAGE));
      
      // Añadir IDs a cada Pokémon basado en su URL
      const pokemonWithIds = data.results.map(pokemon => {
        const urlParts = pokemon.url.split('/');
        const id = urlParts[urlParts.length - 2];
        return {
          ...pokemon,
          id,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          shinyImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
          // Inicializamos region como desconocida - se cargará después
          region: 'Cargando...',
          types: [] // Inicializamos un array vacío para los tipos
        };
      });
      
      setPokemon(pokemonWithIds);
      setFilteredPokemon(pokemonWithIds);
      setLoading(false);
      
      // Inicializar el estado de shiny para todos los Pokémon
      const initialShinyStates = {};
      const initialExpandedStates = {};
      pokemonWithIds.forEach(p => {
        initialShinyStates[p.id] = false;
        initialExpandedStates[p.id] = false;
      });
      setShinyStates(initialShinyStates);
      setExpandedStates(initialExpandedStates);
      
      // Cargar información de región para cada Pokémon
      loadRegionInfo(pokemonWithIds);
      
      // Cargar información de tipos para los Pokémon de la página actual
      loadTypesForCurrentPage(pokemonWithIds);
      
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
      setError('Error al cargar los datos de Pokémon. Intenta de nuevo más tarde.');
      setLoading(false);
    }
  };
  
  // Función para cargar información de región
  const loadRegionInfo = async (pokemonList) => {
    try {
      // Obtener datos de especies para determinar regiones
      const speciesData = {};
      
      // Obtener información de todas las generaciones
      const genResponse = await fetch('https://pokeapi.co/api/v2/generation');
      const genData = await genResponse.json();
      
      // Para cada generación, obtener sus Pokémon
      for (const genUrl of genData.results) {
        const genDetailResponse = await fetch(genUrl.url);
        const genDetail = await genDetailResponse.json();
        
        // Mapear nombres de regiones según la generación
        let regionName;
        switch (genDetail.main_region.name) {
          case 'kanto': regionName = 'Kanto'; break;
          case 'johto': regionName = 'Johto'; break;
          case 'hoenn': regionName = 'Hoenn'; break;
          case 'sinnoh': regionName = 'Sinnoh'; break;
          case 'unova': regionName = 'Unova'; break;
          case 'kalos': regionName = 'Kalos'; break;
          case 'alola': regionName = 'Alola'; break;
          case 'galar': regionName = 'Galar'; break;
          case 'paldea': regionName = 'Paldea'; break;
          default: regionName = genDetail.main_region.name;
        }
        
        // Asignar región a cada Pokémon en esta generación
        genDetail.pokemon_species.forEach(species => {
          const urlParts = species.url.split('/');
          const speciesId = urlParts[urlParts.length - 2];
          speciesData[speciesId] = regionName;
        });
      }
      
      // Actualizar la lista de Pokémon con la información de región
      const updatedPokemonList = pokemonList.map(pokemon => ({
        ...pokemon,
        region: speciesData[pokemon.id] || 'Desconocida'
      }));
      
      setPokemon(updatedPokemonList);
      setFilteredPokemon(updatedPokemonList);
      
    } catch (error) {
      console.error('Error loading region information:', error);
    }
  };
  
  // Función para cargar los tipos de los Pokémon de la página actual
  const loadTypesForCurrentPage = async (pokemonList) => {
    const currentPokemon = getCurrentPagePokemon(pokemonList);
    
    try {
      // Crear un array de promesas para obtener los tipos de todos los Pokémon
      const typePromises = currentPokemon.map(poke => 
        fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`)
          .then(response => response.json())
          .then(data => ({
            id: poke.id,
            types: data.types.map(typeInfo => typeInfo.type.name)
          }))
      );

      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(typePromises);

      // Actualizar los tipos de todos los Pokémon de una vez
      results.forEach(({ id, types }) => {
        updatePokemonTypes(id, types);
      });
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };
  
  // Función para actualizar los tipos de un Pokémon específico
  const updatePokemonTypes = (id, types) => {
    setPokemon(prevPokemon => {
      return prevPokemon.map(p => {
        if (p.id === id) {
          return { ...p, types };
        }
        return p;
      });
    });
    
    setFilteredPokemon(prevFiltered => {
      return prevFiltered.map(p => {
        if (p.id === id) {
          return { ...p, types };
        }
        return p;
      });
    });
  };
  
  // Función para alternar entre la versión normal y shiny
  const toggleShiny = (id) => {
    setShinyStates(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };
  
  // Función para alternar el estado expandido
  const toggleExpanded = (id) => {
    setExpandedStates(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };
  
  // Función para cargar los tipos de todos los Pokémon
  const loadAllPokemonTypes = async (pokemonList) => {
    try {
      // Crear un array de promesas para obtener los tipos de todos los Pokémon
      const typePromises = pokemonList.map(poke => 
        fetch(`https://pokeapi.co/api/v2/pokemon/${poke.id}`)
          .then(response => response.json())
          .then(data => ({
            id: poke.id,
            types: data.types.map(typeInfo => typeInfo.type.name)
          }))
      );

      // Esperar a que todas las promesas se resuelvan
      const results = await Promise.all(typePromises);

      // Actualizar los tipos de todos los Pokémon de una vez
      results.forEach(({ id, types }) => {
        updatePokemonTypes(id, types);
      });
    } catch (error) {
      console.error('Error fetching types:', error);
    }
  };
  
  // Cargar datos al iniciar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Obtener el conteo total primero
        const countResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
        const countData = await countResponse.json();
        const totalCount = countData.count;
        
        // Obtener todos los Pokémon básicos (solo nombres y URLs)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${totalCount}`);
        const data = await response.json();
        
        // Calcular el número total de páginas
        setTotalPages(Math.ceil(data.results.length / ITEMS_PER_PAGE));
        
        // Añadir IDs a cada Pokémon basado en su URL
        const pokemonWithIds = data.results.map(pokemon => {
          const urlParts = pokemon.url.split('/');
          const id = urlParts[urlParts.length - 2];
          return {
            ...pokemon,
            id,
            image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
            shinyImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
            region: 'Cargando...',
            types: [] // Inicializamos un array vacío para los tipos
          };
        });
        
        setPokemon(pokemonWithIds);
        setFilteredPokemon(pokemonWithIds);
        
        // Cargar información de región para cada Pokémon
        await loadRegionInfo(pokemonWithIds);
        
        // Cargar tipos para todos los Pokémon
        await loadAllPokemonTypes(pokemonWithIds);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching Pokémon data:', error);
        setError('Error al cargar los datos de Pokémon. Intenta de nuevo más tarde.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  // Filtrar Pokémon cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPokemon(pokemon);
    } else {
      const filtered = pokemon.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemon(filtered);
      setCurrentPage(1); // Regresar a la primera página al buscar
    }
  }, [searchTerm, pokemon]);
  
  // Calcular Pokémon para la página actual
  const getCurrentPagePokemon = (list = filteredPokemon) => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return list.slice(startIndex, endIndex);
  };
  
  // Manejar cambio de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Capitalizar primera letra
  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-900 p-4">
      <div className="max-w-[2000px] mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">
            Pokédex Explorer
          </h1>
          
          {/* Barra de búsqueda */}
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Buscar Pokémon por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white bg-opacity-20 text-black placeholder-gray-300 border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <Search className="absolute left-3 top-2.5 text-white opacity-70" size={18} />
          </div>
        </div>
        
        {/* Estado de carga o error */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader className="animate-spin text-white mb-4" size={48} />
            <p className="text-white">Cargando Pokémon...</p>
          </div>
        ) : error ? (
          <div className="bg-red-800 text-white p-4 rounded-lg text-center">
            {error}
          </div>
        ) : (
          <>
            {/* Grid de Pokémon con 5 cartas por fila y 10 filas */}
            <div className="grid grid-cols-5 gap-8 mb-8">
              {getCurrentPagePokemon().map((pokemon) => (
                <div 
                  key={pokemon.id}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 border-2 border-gray-700 overflow-hidden relative group min-h-[400px] w-full"
                >
                  {/* Decoración fondo */}
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')] bg-no-repeat bg-[length:100px_100px] bg-[position:110%_-20%] transition-all duration-500 group-hover:bg-[position:105%_-15%] pointer-events-none"></div>
                  
                  {/* ID del pokémon */}
                  <div className="absolute top-2 left-2 text-sm font-mono bg-gray-700 text-gray-300 px-2 py-1 rounded-md">
                    #{pokemon.id}
                  </div>
                  
                  {/* Contenedor de imagen con efecto */}
                  <div className="w-40 h-40 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mb-3 shadow-inner transition-all duration-300 group-hover:shadow-red-500/20 relative overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      shinyStates[pokemon.id] 
                        ? 'from-yellow-500/30 to-yellow-300/30' 
                        : 'from-yellow-500/10 to-red-500/10'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full`}></div>
                    <img 
                      src={shinyStates[pokemon.id] ? pokemon.shinyImage : pokemon.image} 
                      alt={`${pokemon.name}${shinyStates[pokemon.id] ? ' shiny' : ''}`} 
                      className="w-36 h-36 object-contain transform transition-all duration-500 group-hover:scale-110 z-10"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/120/120";
                        e.target.alt = "Imagen no disponible";
                      }}
                    />
                  </div>
                  
                  {/* Información del Pokémon */}
                  <div className="text-center w-full space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {capitalize(pokemon.name)}
                        {shinyStates[pokemon.id] && (
                          <span className="text-yellow-400 ml-1">✨</span>
                        )}
                      </h3>
                      <button
                        onClick={() => toggleShiny(pokemon.id)}
                        className={`p-1.5 rounded-full transition-all duration-300 flex items-center gap-1 cursor-pointer ${
                          shinyStates[pokemon.id] 
                            ? 'bg-yellow-500/30 text-yellow-300 shadow-lg shadow-yellow-500/20' 
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                        title={shinyStates[pokemon.id] ? "Ver versión normal" : "Ver versión shiny"}
                      >
                        <Star size={20} className={shinyStates[pokemon.id] ? 'fill-yellow-300' : ''} />
                        <span className="text-xs font-medium">
                          {shinyStates[pokemon.id] ? 'Shiny' : 'Normal'}
                        </span>
                      </button>
                    </div>
                    
                    {/* Tipos de Pokémon */}
                    <div className="flex justify-center gap-2 mb-2">
                      {pokemon.types.length > 0 ? (
                        pokemon.types.map((type, index) => (
                          <span 
                            key={index} 
                            className={`${typeColors[type] || 'bg-gray-500'} text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm`}
                          >
                            {capitalize(type)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Cargando tipos...</span>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-300 bg-white/5 px-3 py-1 rounded-full inline-block font-medium tracking-wide">
                      {pokemon.region}
                    </span>
                  </div>
                  
                  {/* Botón Ver más */}
                  <Link 
                    href={`/Pokedex/details/${pokemon.id}`}
                    className="mt-3 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all"
                  >
                    Ver más
                    <ChevronDown size={16} />
                  </Link>
                  
                  {/* Contenido expandido */}
                  {expandedStates[pokemon.id] && (
                    <div className="mt-3 w-full p-3 bg-black/20 rounded-lg text-xs text-gray-200">
                      <p>Información adicional estará disponible pronto...</p>
                    </div>
                  )}
                  
                  {/* Decoración de fondo tipo Poké Ball */}
                  <div className={`absolute bottom-0 right-0 w-full h-1 bg-gradient-to-r ${
                    shinyStates[pokemon.id] 
                      ? 'from-yellow-500 to-yellow-600' 
                      : 'from-red-600 to-red-700'
                  }`}></div>
                </div>
              ))}
            </div>
            
            {/* Si no hay resultados */}
            {filteredPokemon.length === 0 && (
              <div className="bg-white bg-opacity-10 p-6 rounded-lg text-center text-white">
                No se encontraron Pokémon con ese nombre.
              </div>
            )}
            
            {/* Paginación */}
            <div className="flex justify-between items-center">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-full ${
                  currentPage === 1 
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                <ChevronLeft size={16} />
                Anterior
              </button>
              
              <div className="text-white">
                Página {currentPage} de {totalPages} 
                <span className="ml-2 text-sm">
                  ({filteredPokemon.length} Pokémon {searchTerm ? 'encontrados' : 'total'})
                </span>
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || filteredPokemon.length === 0}
                className={`flex items-center gap-1 px-4 py-2 rounded-full ${
                  currentPage === totalPages || filteredPokemon.length === 0
                    ? 'bg-gray-600 opacity-50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white`}
              >
                Siguiente
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PokemonGrid;