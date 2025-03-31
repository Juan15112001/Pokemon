"use client"

import React from 'react';
import { Search, Database, BarChart, ListFilter, Zap, Info } from 'lucide-react';
import Link from 'next/link';

const PokédexLandingPage = () => {
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
      </div>
      
      {/* Contenido principal */}
      <div className="w-full max-w-6xl h-full max-h-full flex flex-col md:flex-row gap-4 p-4 z-10">
        {/* Lado izquierdo - Header e información principal */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="flex items-center mb-4">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-lg mr-4">
              <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full border-2 border-gray-800 flex items-center justify-center">
                <div className="h-5 w-5 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-white to-yellow-300">
              PokéExplorer
            </h1>
          </div>
          
          <p className="text-lg mb-4">
            Explora el mundo Pokémon con nuestra aplicación que utiliza la API oficial de Pokémon
          </p>
          
          <div className="bg-black bg-opacity-30 p-3 rounded-lg mb-4">
            <p className="text-sm">
              PokéExplorer te da acceso a toda la información de la PokéAPI: especies, movimientos, habilidades, tipos y más. Todo lo que necesitas para convertirte en un verdadero Maestro Pokémon.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-black bg-opacity-20 p-2 rounded-lg flex flex-col items-center">
              <span className="text-yellow-300 font-bold text-2xl">+800</span>
              <span className="text-xs">Pokémon en la API</span>
            </div>
            <div className="bg-black bg-opacity-20 p-2 rounded-lg flex flex-col items-center">
              <span className="text-yellow-300 font-bold text-2xl">100%</span>
              <span className="text-xs">Datos oficiales</span>
            </div>
          </div>
          
          <div className="flex gap-3 mt-2">
            <Link href="/Pokedex">
              <button className="flex items-center justify-center gap-1 bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold py-2 px-4 rounded-full transition-all transform hover:scale-105 text-sm">
                <Database size={16} />
                <span>Explorar Pokédex</span>
              </button>
            </Link>
            <button className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold py-2 px-4 rounded-full transition-all transform hover:scale-105 text-sm">
              <Search size={16} />
              <span>Búsqueda Avanzada</span>
            </button>
          </div>
        </div>
        
        {/* Lado derecho - Características basadas en la API */}
        <div className="w-full md:w-1/2 flex flex-col justify-center">
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 shadow-xl border border-white border-opacity-20">
            <h2 className="text-center text-xl font-bold mb-3">Funcionalidades con la API Pokémon</h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-start">
                <Search size={18} className="mr-2 mt-1 flex-shrink-0 text-yellow-300" />
                <div>
                  <h3 className="font-bold text-sm">Búsqueda Completa</h3>
                  <p className="text-xs">Busca Pokémon por nombre, ID, tipo o habilidad</p>
                </div>
              </div>
              
              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-start">
                <Info size={18} className="mr-2 mt-1 flex-shrink-0 text-yellow-300" />
                <div>
                  <h3 className="font-bold text-sm">Detalles Completos</h3>
                  <p className="text-xs">Estadísticas base, evoluciones y movimientos</p>
                </div>
              </div>
              
              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-start">
                <ListFilter size={18} className="mr-2 mt-1 flex-shrink-0 text-yellow-300" />
                <div>
                  <h3 className="font-bold text-sm">Filtros Avanzados</h3>
                  <p className="text-xs">Filtra por generación, habitat o grupo de huevo</p>
                </div>
              </div>
              
              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-start">
                <BarChart size={18} className="mr-2 mt-1 flex-shrink-0 text-yellow-300" />
                <div>
                  <h3 className="font-bold text-sm">Comparativas</h3>
                  <p className="text-xs">Compara estadísticas entre diferentes Pokémon</p>
                </div>
              </div>
              
              <div className="bg-black bg-opacity-30 p-3 rounded-lg flex items-start col-span-2">
                <Zap size={18} className="mr-2 mt-1 flex-shrink-0 text-yellow-300" />
                <div>
                  <h3 className="font-bold text-sm">Análisis de Efectividad</h3>
                  <p className="text-xs">Descubre fortalezas y debilidades de cada tipo para crear estrategias de batalla</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600 mt-4 p-3 rounded-lg">
              <h3 className="font-bold text-sm text-center mb-1">Tecnología Utilizada</h3>
              <p className="text-xs text-center">
                Next.js + React + PokéAPI RESTful 
                • Sin límites de uso • Datos actualizados • Rápido y eficiente
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-2 left-0 w-full text-center text-xs text-white text-opacity-70 z-10">
        © 2025 PokéExplorer - Consume la API oficial de Pokémon • Datos proporcionados por PokéAPI.co
      </div>
    </div>
  );
};

export default PokédexLandingPage;