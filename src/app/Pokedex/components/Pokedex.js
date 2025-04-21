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
  const [nameSearch, setNameSearch] = useState('');
  const [numberSearch, setNumberSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [shinyStates, setShinyStates] = useState({});
  const [expandedStates, setExpandedStates] = useState({});
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPokemon, setTotalPokemon] = useState(0);
  
  // New filter states
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedRegions, setSelectedRegions] = useState([]);
  const [tempSelectedTypes, setTempSelectedTypes] = useState([]);
  const [tempSelectedRegions, setTempSelectedRegions] = useState([]);
  
  const ITEMS_PER_PAGE = 50; // 10 rows of 5 cards each
  
  // All available regions
  const regions = ['Kanto', 'Johto', 'Hoenn', 'Sinnoh', 'Unova', 'Kalos', 'Alola', 'Galar', 'Paldea'];
  
  // All available types
  const allTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice', 'fighting',
    'poison', 'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost',
    'dragon', 'dark', 'steel', 'fairy'
  ];
  
  // Colors for Pokémon types
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
    // Additional types
    unknown: 'bg-gray-500',
    shadow: 'bg-gray-700'
  };
  
  // Function to load more Pokémon in batches
  const loadMorePokemon = async (offset) => {
    try {
      setLoadingMore(true);
      const BATCH_SIZE = 200;
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${BATCH_SIZE}&offset=${offset}`);
      const data = await response.json();
      
      const newPokemon = data.results.map(pokemon => {
        const urlParts = pokemon.url.split('/');
        const id = urlParts[urlParts.length - 2];
        return {
          ...pokemon,
          id,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          shinyImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
          region: 'Loading...',
          types: []
        };
      });

      // Sort new Pokémon by ID
      newPokemon.sort((a, b) => parseInt(a.id) - parseInt(b.id));

      // Update shiny states for new Pokémon
      const newShinyStates = { ...shinyStates };
      const newExpandedStates = { ...expandedStates };
      newPokemon.forEach(p => {
        newShinyStates[p.id] = false;
        newExpandedStates[p.id] = false;
      });
      setShinyStates(newShinyStates);
      setExpandedStates(newExpandedStates);

      // Update Pokémon list and maintain order
      setPokemon(prev => {
        const combined = [...prev, ...newPokemon];
        return combined.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      });
      setFilteredPokemon(prev => {
        const combined = [...prev, ...newPokemon];
        return combined.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      });

      // Load additional info for new Pokémon
      await loadAdditionalInfo(newPokemon);
      
    } catch (error) {
      console.error('Error loading more Pokémon:', error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  // Function to fetch Pokémon data from the API
  const fetchPokemon = async () => {
    try {
      setLoading(true);
      const INITIAL_LOAD_COUNT = 200;
      
      // Get total count first
      const countResponse = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1');
      const countData = await countResponse.json();
      setTotalPokemon(countData.count);
      
      // Get initial batch of Pokémon
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${INITIAL_LOAD_COUNT}`);
      const data = await response.json();
      
      // Calculate total number of pages
      setTotalPages(Math.ceil(countData.count / ITEMS_PER_PAGE));
      
      // Add IDs to each Pokémon based on their URL
      const pokemonWithIds = data.results.map(pokemon => {
        const urlParts = pokemon.url.split('/');
        const id = urlParts[urlParts.length - 2];
        return {
          ...pokemon,
          id,
          image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
          shinyImage: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`,
          region: 'Loading...',
          types: []
        };
      });

      // Sort initial batch by ID
      pokemonWithIds.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      
      setPokemon(pokemonWithIds);
      setFilteredPokemon(pokemonWithIds);
      
      // Initialize shiny state for all Pokémon
      const initialShinyStates = {};
      const initialExpandedStates = {};
      pokemonWithIds.forEach(p => {
        initialShinyStates[p.id] = false;
        initialExpandedStates[p.id] = false;
      });
      setShinyStates(initialShinyStates);
      setExpandedStates(initialExpandedStates);
      
      // Load additional information for initial batch
      await loadAdditionalInfo(pokemonWithIds);
      
      setLoading(false);

      // Start loading the rest of the Pokémon in batches
      const remainingBatches = Math.ceil((countData.count - INITIAL_LOAD_COUNT) / 200);
      for (let i = 1; i <= remainingBatches; i++) {
        const offset = INITIAL_LOAD_COUNT + (i - 1) * 200;
        await loadMorePokemon(offset);
      }
      
    } catch (error) {
      console.error('Error fetching Pokémon data:', error);
      setError('Error loading Pokémon data. Please try again later.');
      setLoading(false);
    }
  };
  
  // Function to load region information
  const loadRegionInfo = async (pokemonList) => {
    try {
      // Get species data to determine regions
      const speciesData = {};
      
      // Get information for all generations
      const genResponse = await fetch('https://pokeapi.co/api/v2/generation');
      const genData = await genResponse.json();
      
      // For each generation, get their Pokémon
      for (const genUrl of genData.results) {
        const genDetailResponse = await fetch(genUrl.url);
        const genDetail = await genDetailResponse.json();
        
        // Map region names according to generation
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
        
        // Assign region to each Pokémon in this generation
        genDetail.pokemon_species.forEach(species => {
          const urlParts = species.url.split('/');
          const speciesId = urlParts[urlParts.length - 2];
          speciesData[speciesId] = regionName;
        });
      }
      
      // Update Pokémon list with region information
      const updatedPokemonList = pokemonList.map(pokemon => ({
        ...pokemon,
        region: speciesData[pokemon.id] || 'Unknown'
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
  
  // Function to load additional information
  const loadAdditionalInfo = async (pokemonList) => {
    try {
      // Load region information
      await loadRegionInfo(pokemonList);
      
      // Load type information
      await loadAllPokemonTypes(pokemonList);
      
    } catch (error) {
      console.error('Error loading additional information:', error);
    }
  };
  
  // Update filter effect
  useEffect(() => {
    let filtered = pokemon;
    
    // Apply name filter
    if (nameSearch.trim() !== '') {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }
    
    // Apply number filter
    if (numberSearch.trim() !== '') {
      filtered = filtered.filter(p => 
        p.id.toString().includes(numberSearch)
      );
    }
    
    // Apply type filters
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => 
        selectedTypes.every(type => p.types.includes(type))
      );
    }
    
    // Apply region filters
    if (selectedRegions.length > 0) {
      filtered = filtered.filter(p => 
        selectedRegions.includes(p.region)
      );
    }
    
    setFilteredPokemon(filtered);
    setCurrentPage(1);
  }, [nameSearch, numberSearch, selectedTypes, selectedRegions, pokemon]);
  
  // Apply filters when filter button is clicked
  const applyFilters = () => {
    setSelectedTypes(tempSelectedTypes);
    setSelectedRegions(tempSelectedRegions);
    setShowFilters(false);
  };
  
  // Reset filters
  const resetFilters = () => {
    setTempSelectedTypes([]);
    setTempSelectedRegions([]);
    setSelectedTypes([]);
    setSelectedRegions([]);
    setShowFilters(false);
  };
  
  // Load data when component mounts
  useEffect(() => {
    fetchPokemon();
  }, []);
  
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
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <h1 className="text-3xl font-bold text-white">
              Pokédex Explorer
            </h1>
            <div className="hidden md:block w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
              <img 
                src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" 
                alt="Poké Ball" 
                className="w-8 h-8"
              />
            </div>
          </div>
          
          {/* Barra de búsqueda y filtros */}
          <div className="w-full md:w-2/3 space-y-4">
            {/* Search bars */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 relative group">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 text-white placeholder-gray-300 border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                />
                <Search className="absolute left-3 top-3.5 text-white opacity-70 group-hover:opacity-100 transition-opacity" size={18} />
              </div>
              <div className="w-full md:w-1/2 relative group">
                <input
                  type="text"
                  placeholder="Search by Pokédex number..."
                  value={numberSearch}
                  onChange={(e) => setNumberSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 text-white placeholder-gray-300 border-2 border-white/20 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-300"
                />
                <Search className="absolute left-3 top-3.5 text-white opacity-70 group-hover:opacity-100 transition-opacity" size={18} />
              </div>
            </div>

            {/* Filters dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-2 bg-white/10 text-white rounded-full border-2 border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <span>Filters</span>
                <ChevronDown className={`transform transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} size={20} />
              </button>

              {showFilters && (
                <div className="absolute z-10 w-full mt-2 p-4 bg-gray-800/90 backdrop-blur-sm rounded-2xl border-2 border-white/20 space-y-4">
                  {/* Type filters */}
                  <div>
                    <h3 className="text-white font-medium mb-2">Types</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => {
                            setTempSelectedTypes(prev => 
                              prev.includes(type)
                                ? prev.filter(t => t !== type)
                                : [...prev, type]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                            tempSelectedTypes.includes(type)
                              ? `${typeColors[type]} text-white shadow-lg`
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {capitalize(type)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Region filters */}
                  <div>
                    <h3 className="text-white font-medium mb-2">Regions</h3>
                    <div className="flex flex-wrap gap-2">
                      {regions.map(region => (
                        <button
                          key={region}
                          onClick={() => {
                            setTempSelectedRegions(prev => 
                              prev.includes(region)
                                ? prev.filter(r => r !== region)
                                : [...prev, region]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                            tempSelectedRegions.includes(region)
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {region}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={applyFilters}
                      className="flex-1 py-2 bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 transition-all duration-300"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={resetFilters}
                      className="flex-1 py-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition-all duration-300"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Estado de carga o error */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <Loader className="animate-spin text-white mb-4" size={48} />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full blur-xl opacity-20"></div>
            </div>
            <p className="text-white text-lg mt-4">Loading Pokémon...</p>
          </div>
        ) : error ? (
          <div className="bg-red-800/50 backdrop-blur-sm text-white p-6 rounded-2xl text-center border-2 border-white/20">
            <p className="text-xl font-medium">{error}</p>
          </div>
        ) : (
          <>
            {/* Grid de Pokémon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-8">
              {getCurrentPagePokemon().map((pokemon) => (
                <div 
                  key={pokemon.id}
                  className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-4 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-red-500/20 border-2 border-gray-700/50 overflow-hidden relative group min-h-[400px] w-full backdrop-blur-sm"
                >
                  {/* Decoración fondo */}
                  <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png')] bg-no-repeat bg-[length:100px_100px] bg-[position:110%_-20%] transition-all duration-500 group-hover:bg-[position:105%_-15%] pointer-events-none"></div>
                  
                  {/* ID del pokémon */}
                  <div className="absolute top-2 left-2 text-sm font-mono bg-gray-700/80 text-gray-300 px-2 py-1 rounded-md backdrop-blur-sm">
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
                        e.target.alt = "Image not available";
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
                        title={shinyStates[pokemon.id] ? "View normal version" : "View shiny version"}
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
                            className={`${typeColors[type] || 'bg-gray-500'} text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm backdrop-blur-sm`}
                          >
                            {capitalize(type)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">Loading types...</span>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-300 bg-white/5 px-3 py-1 rounded-full inline-block font-medium tracking-wide backdrop-blur-sm">
                      {pokemon.region}
                    </span>
                  </div>
                  
                  {/* Botón Ver más */}
                  <Link 
                    href={`/Pokedex/details/${pokemon.id}`}
                    className="mt-3 flex items-center gap-1 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm transition-all group-hover:shadow-lg group-hover:shadow-red-500/20"
                  >
                    View more
                    <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
                  </Link>
                  
                  {/* Contenido expandido */}
                  {expandedStates[pokemon.id] && (
                    <div className="mt-3 w-full p-3 bg-black/20 rounded-lg text-xs text-gray-200 backdrop-blur-sm">
                      <p>Additional information coming soon...</p>
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
              <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl text-center text-white border-2 border-white/20">
                <p className="text-lg">No Pokémon found with these search criteria.</p>
              </div>
            )}
            
            {/* Paginación */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border-2 border-white/20">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-4 py-2 rounded-full ${
                  currentPage === 1 
                    ? 'bg-gray-600/50 opacity-50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-all duration-300`}
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="text-white text-center">
                <p className="text-lg font-medium">Page {currentPage} of {totalPages}</p>
                <p className="text-sm text-gray-300">
                  {filteredPokemon.length} Pokémon {nameSearch || numberSearch ? 'found' : 'total'}
                </p>
              </div>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || filteredPokemon.length === 0}
                className={`flex items-center gap-1 px-4 py-2 rounded-full ${
                  currentPage === totalPages || filteredPokemon.length === 0
                    ? 'bg-gray-600/50 opacity-50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition-all duration-300`}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
        
        {/* Loading indicator for additional Pokémon */}
        {loadingMore && (
          <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm p-4 rounded-lg text-white flex items-center gap-2">
            <Loader className="animate-spin" size={20} />
            <span>Loading more Pokémon...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PokemonGrid;