import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import YouTube from 'react-youtube';

// Netflix Clone Components

// Netflix API Configuration
const TMDB_API_KEY = 'c8dea14dc917687ac631a52620e4f7ad';
const TMDB_API_KEY_2 = '3cb41ecea3bf606c56552db3d17adefd';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TMDB_BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

// Mock images from vision expert
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1632469802964-aaa15d96fee0',
  'https://images.unsplash.com/photo-1608648682094-e3024959c6d1',
  'https://images.unsplash.com/photo-1662330357283-93ab0a0c4843'
];

const POSTER_IMAGES = [
  'https://images.pexels.com/photos/7563612/pexels-photo-7563612.jpeg',
  'https://images.pexels.com/photos/7563609/pexels-photo-7563609.jpeg',
  'https://images.unsplash.com/photo-1650109420581-3f3c336b4cef',
  'https://images.pexels.com/photos/16360585/pexels-photo-16360585.jpeg',
  'https://images.pexels.com/photos/15357883/pexels-photo-15357883.jpeg',
  'https://images.unsplash.com/photo-1636008007951-a70d957cfe55',
  'https://images.unsplash.com/photo-1546803073-23568b8c98e6',
  'https://images.unsplash.com/photo-1707282737252-4841778b63fe',
  'https://images.pexels.com/photos/5961622/pexels-photo-5961622.jpeg',
  'https://images.unsplash.com/photo-1700422300101-51c7403efa0e',
  'https://images.unsplash.com/photo-1651499833146-0cd21fe5ca9b',
  'https://images.unsplash.com/photo-1656164596431-edf9eaf65ad8'
];

// Netflix Header Component
export const NetflixHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-black' : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="px-4 lg:px-16 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-red-600 text-3xl font-bold tracking-tight">NETFLIX</h1>
          <nav className="hidden md:flex space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">TV Shows</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Movies</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">New & Popular</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">My List</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="bg-black border border-gray-600 text-white px-4 py-2 rounded hidden md:block focus:outline-none focus:border-white"
            />
          </div>
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white text-sm font-semibold">U</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

// Hero Section Component
export const HeroSection = ({ featuredContent, onPlayTrailer }) => {
  return (
    <div className="relative h-screen flex items-center justify-start">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%), url(${featuredContent?.backdrop || HERO_IMAGES[0]})`
        }}
      />
      
      <div className="relative z-10 px-4 lg:px-16 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
            {featuredContent?.title || "Stranger Things"}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed max-w-xl">
            {featuredContent?.overview || "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl."}
          </p>
          
          <div className="flex space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPlayTrailer(featuredContent)}
              className="flex items-center bg-white text-black px-8 py-3 rounded font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center bg-gray-600/70 text-white px-8 py-3 rounded font-semibold text-lg hover:bg-gray-600/90 transition-colors"
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              More Info
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Content Row Component
export const ContentRow = ({ title, items, onItemClick }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-white text-2xl font-semibold mb-4 px-4 lg:px-16">{title}</h2>
      
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-r opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div
          ref={scrollRef}
          className="flex space-x-2 px-4 lg:px-16 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {items.map((item, index) => (
            <ContentCard
              key={item.id || index}
              item={item}
              onClick={() => onItemClick(item)}
              fallbackImage={POSTER_IMAGES[index % POSTER_IMAGES.length]}
            />
          ))}
        </div>
        
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-l opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Content Card Component
export const ContentCard = ({ item, onClick, fallbackImage }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getImageUrl = () => {
    if (imageError || !item.poster_path) {
      return fallbackImage;
    }
    return `${TMDB_IMAGE_BASE_URL}${item.poster_path}`;
  };

  return (
    <motion.div
      className="flex-shrink-0 w-48 cursor-pointer relative"
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
      onClick={() => onClick(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-800">
        <img
          src={getImageUrl()}
          alt={item.title || item.name || 'Content'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 flex items-center justify-center"
            >
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="bg-white text-black p-3 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <h3 className="text-white text-sm mt-2 font-medium truncate">
        {item.title || item.name || 'Untitled'}
      </h3>
    </motion.div>
  );
};

// Modal Component
export const ContentModal = ({ isOpen, onClose, content, trailerKey }) => {
  if (!isOpen || !content) return null;

  const youtubeOpts = {
    height: '400',
    width: '100%',
    playerVars: {
      autoplay: 1,
      modestbranding: 1,
      rel: 0
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {trailerKey ? (
              <div className="aspect-video">
                <YouTube videoId={trailerKey} opts={youtubeOpts} />
              </div>
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                <p className="text-white text-lg">No trailer available</p>
              </div>
            )}
          </div>
          
          <div className="p-6">
            <h2 className="text-white text-3xl font-bold mb-4">
              {content.title || content.name}
            </h2>
            
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-green-500 font-semibold">
                {Math.round(content.vote_average * 10)}% Match
              </span>
              <span className="text-gray-400">
                {content.release_date?.substring(0, 4) || content.first_air_date?.substring(0, 4)}
              </span>
              <span className="border border-gray-400 px-2 py-1 text-xs text-gray-400">
                HD
              </span>
            </div>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              {content.overview}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Genres: </span>
                <span className="text-white">
                  {content.genre_ids?.slice(0, 3).join(', ') || 'Action, Drama, Thriller'}
                </span>
              </div>
              
              <div>
                <span className="text-gray-400">Rating: </span>
                <span className="text-white">
                  {content.vote_average?.toFixed(1) || '8.5'}/10
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// TMDB API Functions
export const fetchFromTMDB = async (endpoint, apiKey = TMDB_API_KEY) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${apiKey}`);
    if (!response.ok) {
      throw new Error('API request failed');
    }
    return await response.json();
  } catch (error) {
    console.error('TMDB API Error:', error);
    // Fallback to mock data if API fails
    return generateMockData(endpoint);
  }
};

export const fetchTrailer = async (contentId, type = 'movie', apiKey = TMDB_API_KEY) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/${type}/${contentId}/videos?api_key=${apiKey}`
    );
    if (!response.ok) throw new Error('Failed to fetch trailer');
    
    const data = await response.json();
    const trailer = data.results?.find(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    );
    
    return trailer?.key || null;
  } catch (error) {
    console.error('Trailer fetch error:', error);
    return 'dQw4w9WgXcQ'; // Rick Roll as fallback trailer
  }
};

// Mock data generator for fallback
const generateMockData = (endpoint) => {
  const mockItems = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Movie ${i + 1}`,
    name: `TV Show ${i + 1}`,
    overview: `This is a fascinating story about adventure, drama, and excitement. A must-watch content that will keep you entertained for hours.`,
    poster_path: null, // Will use fallback images
    backdrop_path: null,
    vote_average: 7.5 + Math.random() * 2,
    release_date: '2024-01-01',
    first_air_date: '2024-01-01',
    genre_ids: [28, 12, 53] // Action, Adventure, Thriller
  }));

  return { results: mockItems };
};
