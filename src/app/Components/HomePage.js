"use client"

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

const PokédexLandingPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        router.push('/Pokedex');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, router]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        {/* Efectos de luz de fondo */}
        <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-red-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 md:w-64 h-32 md:h-64 bg-blue-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 left-1/3 w-24 md:w-48 h-24 md:h-48 bg-yellow-500 rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-3/4 right-1/3 w-24 md:w-48 h-24 md:h-48 bg-purple-500 rounded-full opacity-5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Pokébolas flotantes decorativas */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-${i % 2 === 0 ? '8 md:16' : '6 md:12'} h-${i % 2 === 0 ? '8 md:16' : '6 md:12'}`}
            style={{
              top: `${20 + (i * 20)}%`,
              left: `${10 + (i * 20)}%`,
            }}
            animate={{
              y: [0, i % 2 === 0 ? -20 : 20, 0],
              rotate: [0, i % 2 === 0 ? 360 : -360]
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <div className="w-full h-1/2 bg-gradient-to-b from-red-600 to-red-500 rounded-t-full"></div>
            <div className="w-full h-1/2 bg-gradient-to-t from-white to-gray-100 rounded-b-full"></div>
            <div className={`absolute top-1/2 left-0 w-full h-${i % 2 === 0 ? '1 md:2' : '1 md:1.5'} bg-black transform -translate-y-${i % 2 === 0 ? '0.5 md:1' : '0.5 md:0.75'}`}></div>
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-${i % 2 === 0 ? '2 md:4' : '1.5 md:3'} h-${i % 2 === 0 ? '2 md:4' : '1.5 md:3'} bg-white rounded-full border-${i % 2 === 0 ? '1 md:2' : '1 md:1.5'} border-black`}></div>
          </motion.div>
        ))}

        {/* Efecto de partículas */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 md:w-1 h-0.5 md:h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Efecto de destellos */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 md:w-2 h-1 md:h-2 bg-yellow-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 1 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 3
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Título y subtítulo */}
        <div className="text-center mb-4 md:mb-8">
          <motion.h1 
            className="text-3xl md:text-5xl font-extrabold text-white mb-2 md:mb-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-yellow-500">
              PokéExplorer
            </span>
          </motion.h1>
          <motion.p 
            className="text-base md:text-xl text-white/80"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Tu guía definitiva en el mundo Pokémon
          </motion.p>
        </div>

        {/* Pokébola principal */}
        <motion.div 
          className="relative w-[250px] h-[250px] md:w-[400px] md:h-[400px] cursor-pointer"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence>
            {!isOpen && (
              <>
                {/* Parte superior roja */}
                <motion.div 
                  className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-red-600 via-red-500 to-red-600 rounded-t-full overflow-hidden"
                  exit={{ y: -100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-b from-white/30 to-transparent rounded-full blur-sm"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-black/20 via-black/10 to-black/20"></div>
                </motion.div>

                {/* Parte inferior blanca */}
                <motion.div 
                  className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white via-gray-100 to-white rounded-b-full overflow-hidden"
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute bottom-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-t from-white/20 to-transparent rounded-full blur-sm"></div>
                  <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-black/5 to-transparent"></div>
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-black/10 via-black/5 to-black/10"></div>
                </motion.div>

                {/* Línea central negra con detalles */}
                <motion.div 
                  className="absolute left-0 w-full h-6 md:h-10 bg-gradient-to-r from-black via-gray-900 to-black top-1/2 transform -translate-y-3 md:-translate-y-5"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute top-0 left-0 w-full h-0.5 md:h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-0.5 md:h-1 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
                </motion.div>

                {/* Botón central con más detalles */}
                <motion.div 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 md:w-28 md:h-28 bg-white rounded-full border-4 md:border-8 border-black flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                  exit={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-white/50 to-transparent rounded-full blur-sm"></div>
                  <div className="w-8 h-8 md:w-16 md:h-16 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 rounded-full border-2 md:border-4 border-black flex items-center justify-center shadow-inner">
                    <div className="w-3 h-3 md:w-6 md:h-6 bg-black rounded-full relative">
                      <div className="absolute top-0.5 left-0.5 w-0.5 md:w-1 h-0.5 md:h-1 bg-white/50 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Efecto de luz al abrir */}
          <AnimatePresence>
            {isOpen && (
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <motion.div 
                  className="w-24 h-24 md:w-40 md:h-40 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 rounded-full shadow-[0_0_30px_rgba(255,255,0,0.5)]"
                  animate={{ 
                    scale: [1, 1.5, 2],
                    opacity: [1, 0.8, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    times: [0, 0.5, 1]
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Instrucción de uso y estadísticas */}
        <div className="mt-4 md:mt-8 flex flex-col items-center gap-2 md:gap-4">
          <motion.p 
            className="text-white/60 text-center max-w-md text-sm md:text-base"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Haz clic en la Pokébola para comenzar tu aventura
          </motion.p>

          <motion.div 
            className="flex gap-4 md:gap-8 mt-2 md:mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">+1000</div>
              <div className="text-xs md:text-sm text-white/60">Pokémon</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">18</div>
              <div className="text-xs md:text-sm text-white/60">Tipos</div>
            </div>
            <div className="text-center">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">9</div>
              <div className="text-xs md:text-sm text-white/60">Generaciones</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer con efecto de brillo */}
      <motion.div 
        className="absolute bottom-2 md:bottom-4 left-0 w-full text-center text-[10px] md:text-xs text-white text-opacity-70 z-10 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <div className="relative inline-block">
          <span>© 2025 PokéExplorer</span>
          <motion.span 
            className="absolute -bottom-1 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div className="mt-0.5 md:mt-1">Consume la API oficial de Pokémon • Datos proporcionados por PokéAPI.co</div>
      </motion.div>
    </div>
  );
};

export default PokédexLandingPage;