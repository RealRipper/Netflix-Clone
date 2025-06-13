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

// Profile avatars
const PROFILE_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
];

// Local Storage Utilities
export const ProfileStorage = {
  getProfiles: () => {
    const profiles = localStorage.getItem('netflix_profiles');
    return profiles ? JSON.parse(profiles) : [
      { id: 1, name: 'User 1', avatar: PROFILE_AVATARS[0], myList: [], continueWatching: [] },
      { id: 2, name: 'User 2', avatar: PROFILE_AVATARS[1], myList: [], continueWatching: [] },
      { id: 3, name: 'Kids', avatar: PROFILE_AVATARS[2], myList: [], continueWatching: [] }
    ];
  },
  
  saveProfiles: (profiles) => {
    localStorage.setItem('netflix_profiles', JSON.stringify(profiles));
  },
  
  getCurrentProfile: () => {
    const currentId = localStorage.getItem('netflix_current_profile');
    const profiles = ProfileStorage.getProfiles();
    return profiles.find(p => p.id === parseInt(currentId)) || profiles[0];
  },
  
  setCurrentProfile: (profileId) => {
    localStorage.setItem('netflix_current_profile', profileId.toString());
  },
  
  addToMyList: (profileId, content) => {
    const profiles = ProfileStorage.getProfiles();
    const profile = profiles.find(p => p.id === profileId);
    if (profile && !profile.myList.find(item => item.id === content.id)) {
      profile.myList.push(content);
      ProfileStorage.saveProfiles(profiles);
    }
  },
  
  removeFromMyList: (profileId, contentId) => {
    const profiles = ProfileStorage.getProfiles();
    const profile = profiles.find(p => p.id === profileId);
    if (profile) {
      profile.myList = profile.myList.filter(item => item.id !== contentId);
      ProfileStorage.saveProfiles(profiles);
    }
  },
  
  isInMyList: (profileId, contentId) => {
    const profile = ProfileStorage.getProfiles().find(p => p.id === profileId);
    return profile ? profile.myList.some(item => item.id === contentId) : false;
  }
};

// Profile Selection Component
export const ProfileSelection = ({ onProfileSelect, onClose }) => {
  const [profiles] = useState(ProfileStorage.getProfiles());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <h1 className="text-white text-5xl font-light mb-12">Who's watching?</h1>
        
        <div className="flex space-x-8 justify-center">
          {profiles.map(profile => (
            <motion.div
              key={profile.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer text-center"
              onClick={() => onProfileSelect(profile)}
            >
              <div className="w-32 h-32 rounded-lg overflow-hidden mb-4 bg-gray-700">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-white text-xl font-light">{profile.name}</p>
            </motion.div>
          ))}
        </div>
        
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white mt-8 text-lg border border-gray-400 px-6 py-2 rounded hover:border-white transition-colors"
        >
          Manage Profiles
        </button>
      </div>
    </motion.div>
  );
};

// Search Component
export const SearchModal = ({ isOpen, onClose, onContentClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
      setSearchResults(response.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    searchTimeout.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 pt-20"
    >
      <div className="container mx-auto px-4 lg:px-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white text-3xl font-semibold">Search</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 p-2"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for movies, TV shows..."
            className="w-full bg-gray-800 text-white px-6 py-4 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-red-600"
            autoFocus
          />
        </div>
        
        {loading && (
          <div className="text-center py-8">
            <div className="text-white text-xl">Searching...</div>
          </div>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {searchResults.map((item, index) => (
            <SearchResultCard
              key={item.id}
              item={item}
              onClick={() => onContentClick(item)}
              fallbackImage={POSTER_IMAGES[index % POSTER_IMAGES.length]}
            />
          ))}
        </div>
        
        {searchQuery && !loading && searchResults.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-xl">No results found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Search Result Card
export const SearchResultCard = ({ item, onClick, fallbackImage }) => {
  const [imageError, setImageError] = useState(false);

  const getImageUrl = () => {
    if (imageError || !item.poster_path) {
      return fallbackImage;
    }
    return `${TMDB_IMAGE_BASE_URL}${item.poster_path}`;
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer"
      onClick={() => onClick(item)}
    >
      <div className="aspect-[2/3] rounded-lg overflow-hidden bg-gray-800 mb-2">
        <img
          src={getImageUrl()}
          alt={item.title || item.name || 'Content'}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      <h3 className="text-white text-sm font-medium truncate">
        {item.title || item.name || 'Untitled'}
      </h3>
      <p className="text-gray-400 text-xs">
        {item.media_type === 'movie' ? 'Movie' : 'TV Show'}
      </p>
    </motion.div>
  );
};

// Netflix Header Component (Enhanced)
export const NetflixHeader = ({ currentProfile, onProfileClick, onSearchClick }) => {
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
      className={`fixed top-0 w-full z-40 transition-colors duration-300 ${
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
          <button
            onClick={onSearchClick}
            className="text-white hover:text-gray-300 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {currentProfile && (
            <button
              onClick={onProfileClick}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 rounded overflow-hidden">
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

// Hero Section Component (Enhanced)
export const HeroSection = ({ featuredContent, onPlayTrailer, currentProfile, onAddToList }) => {
  const isInList = currentProfile && featuredContent ? 
    ProfileStorage.isInMyList(currentProfile.id, featuredContent.id) : false;

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
            {featuredContent?.title || featuredContent?.name || "Stranger Things"}
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
              onClick={() => onAddToList(featuredContent)}
              className={`flex items-center px-8 py-3 rounded font-semibold text-lg transition-colors ${
                isInList 
                  ? 'bg-gray-600 text-white hover:bg-gray-700' 
                  : 'bg-gray-600/70 text-white hover:bg-gray-600/90'
              }`}
            >
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isInList ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
              </svg>
              {isInList ? 'In My List' : 'My List'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Content Row Component (Enhanced)
export const ContentRow = ({ title, items, onItemClick, currentProfile, onAddToList }) => {
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
              onAddToList={() => onAddToList(item)}
              currentProfile={currentProfile}
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

// Content Card Component (Enhanced)
export const ContentCard = ({ item, onClick, onAddToList, currentProfile, fallbackImage }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isInList = currentProfile ? ProfileStorage.isInMyList(currentProfile.id, item.id) : false;

  const getImageUrl = () => {
    if (imageError || !item.poster_path) {
      return fallbackImage;
    }
    return `${TMDB_IMAGE_BASE_URL}${item.poster_path}`;
  };

  const handleAddToList = (e) => {
    e.stopPropagation();
    onAddToList(item);
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
              <div className="flex space-x-2">
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-white text-black p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={handleAddToList}
                  className={`p-2 rounded-full transition-colors ${
                    isInList 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isInList ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                  </svg>
                </motion.button>
              </div>
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

// Modal Component (Enhanced)
export const ContentModal = ({ isOpen, onClose, content, trailerKey, currentProfile, onAddToList }) => {
  if (!isOpen || !content) return null;

  const isInList = currentProfile ? ProfileStorage.isInMyList(currentProfile.id, content.id) : false;

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
            
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => onAddToList(content)}
                className={`flex items-center px-6 py-2 rounded font-semibold transition-colors ${
                  isInList 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-white text-black hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isInList ? "M5 13l4 4L19 7" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                </svg>
                {isInList ? 'In My List' : 'Add to My List'}
              </button>
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

// TMDB API Functions (Enhanced)
export const fetchFromTMDB = async (endpoint, apiKey = TMDB_API_KEY) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${apiKey}`);
    if (!response.ok) {
      // Try second API key if first fails
      if (apiKey === TMDB_API_KEY) {
        return fetchFromTMDB(endpoint, TMDB_API_KEY_2);
      }
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
    
    return trailer?.key || 'dQw4w9WgXcQ'; // Rick Roll as fallback trailer
  } catch (error) {
    console.error('Trailer fetch error:', error);
    return 'dQw4w9WgXcQ'; // Rick Roll as fallback trailer
  }
};

// Mock data generator for fallback (Enhanced)
const generateMockData = (endpoint) => {
  const getGenreTitle = (endpoint) => {
    if (endpoint.includes('genre=27')) return 'Horror';
    if (endpoint.includes('genre=878')) return 'Sci-Fi';
    if (endpoint.includes('genre=10749')) return 'Romance';
    if (endpoint.includes('genre=16')) return 'Animation';
    if (endpoint.includes('genre=99')) return 'Documentary';
    return 'Movie';
  };

  const genreType = getGenreTitle(endpoint);
  
  const mockItems = Array.from({ length: 20 }, (_, i) => ({
    id: Math.floor(Math.random() * 10000) + i,
    title: `${genreType} ${i + 1}`,
    name: `${genreType} Series ${i + 1}`,
    overview: `This is a fascinating ${genreType.toLowerCase()} story about adventure, drama, and excitement. A must-watch content that will keep you entertained for hours.`,
    poster_path: null, // Will use fallback images
    backdrop_path: null,
    vote_average: 7.5 + Math.random() * 2,
    release_date: '2024-01-01',
    first_air_date: '2024-01-01',
    genre_ids: [28, 12, 53], // Action, Adventure, Thriller
    media_type: Math.random() > 0.5 ? 'movie' : 'tv'
  }));

  return { results: mockItems };
};
