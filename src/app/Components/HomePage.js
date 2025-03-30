"use client"

import React from 'react';
import { ArrowRight, Database } from 'lucide-react';

const PokédexLandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 flex flex-col items-center justify-center p-6 text-white">
      <div className="max-w-3xl w-full bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-white border-opacity-20">
        <div className="flex flex-col items-center mb-8">
          <div className="h-24 w-24 bg-white rounded-full mb-4 flex items-center justify-center">
            <div className="h-16 w-16 bg-red-500 rounded-full border-4 border-gray-800 flex items-center justify-center">
              <div className="h-8 w-8 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-center">PokéExplorer</h1>
          <p className="text-xl text-center mb-6">Tu guía definitiva al mundo Pokémon</p>
          <div className="w-full max-w-md bg-black bg-opacity-30 p-4 rounded-lg mb-8">
            <p className="text-center italic">
              "Para convertirte en un Maestro Pokémon, primero debes conocer a todos los Pokémon. Nuestra Pokédex te ayudará en tu viaje."
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-black bg-opacity-20 p-4 rounded-lg flex flex-col items-center">
            <span className="text-yellow-300 font-bold text-lg mb-2">+800</span>
            <span>Pokémon registrados</span>
          </div>
          <div className="bg-black bg-opacity-20 p-4 rounded-lg flex flex-col items-center">
            <span className="text-yellow-300 font-bold text-lg mb-2">18</span>
            <span>Tipos de Pokémon</span>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105">
            <Database size={20} />
            <span>Explorar Pokédex</span>
          </button>
          <button className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105">
            <span>Modo Entrenador</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-white text-opacity-70">
        © 2025 PokéExplorer - Creado para entrenadores Pokémon
      </div>
    </div>
  );
};

export default PokédexLandingPage;