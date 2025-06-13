import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  NetflixHeader, 
  HeroSection, 
  ContentRow, 
  ContentModal,
  fetchFromTMDB,
  fetchTrailer
} from './components';

function App() {
  const [featuredContent, setFeaturedContent] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [documentaries, setDocumentaries] = useState([]);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Fetch different categories of content
      const [
        trending,
        popular,
        action,
        comedy,
        docs
      ] = await Promise.all([
        fetchFromTMDB('/trending/all/week'),
        fetchFromTMDB('/tv/popular'),
        fetchFromTMDB('/discover/movie?with_genres=28'), // Action
        fetchFromTMDB('/discover/movie?with_genres=35'), // Comedy
        fetchFromTMDB('/discover/movie?with_genres=99')  // Documentary
      ]);

      // Set featured content (first trending item)
      if (trending.results && trending.results.length > 0) {
        setFeaturedContent(trending.results[0]);
      }

      setTrendingMovies(trending.results || []);
      setPopularSeries(popular.results || []);
      setActionMovies(action.results || []);
      setComedyMovies(comedy.results || []);
      setDocumentaries(docs.results || []);
      
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayTrailer = async (content) => {
    if (!content) return;
    
    setModalContent(content);
    setIsModalOpen(true);
    
    // Fetch trailer
    const type = content.title ? 'movie' : 'tv';
    const trailer = await fetchTrailer(content.id, type);
    setTrailerKey(trailer);
  };

  const handleContentClick = (content) => {
    handlePlayTrailer(content);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
    setTrailerKey(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl font-bold mb-4">NETFLIX</div>
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NetflixHeader />
      
      <main>
        <HeroSection 
          featuredContent={featuredContent}
          onPlayTrailer={handlePlayTrailer}
        />
        
        <div className="relative z-10 -mt-32 space-y-12">
          <ContentRow
            title="Trending Now"
            items={trendingMovies.slice(0, 15)}
            onItemClick={handleContentClick}
          />
          
          <ContentRow
            title="Popular on Netflix"
            items={popularSeries.slice(0, 15)}
            onItemClick={handleContentClick}
          />
          
          <ContentRow
            title="Action & Adventure"
            items={actionMovies.slice(0, 15)}
            onItemClick={handleContentClick}
          />
          
          <ContentRow
            title="Comedy Movies"
            items={comedyMovies.slice(0, 15)}
            onItemClick={handleContentClick}
          />
          
          <ContentRow
            title="Documentaries"
            items={documentaries.slice(0, 15)}
            onItemClick={handleContentClick}
          />
        </div>
      </main>
      
      <ContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        content={modalContent}
        trailerKey={trailerKey}
      />
    </div>
  );
}

export default App;
