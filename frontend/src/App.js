import React, { useState, useEffect } from 'react';
import './App.css';
import { 
  NetflixHeader, 
  HeroSection, 
  ContentRow, 
  ContentModal,
  ProfileSelection,
  SearchModal,
  fetchFromTMDB,
  fetchTrailer,
  ProfileStorage
} from './components';

function App() {
  // Content state
  const [featuredContent, setFeaturedContent] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [popularSeries, setPopularSeries] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [documentaries, setDocumentaries] = useState([]);
  const [horrorMovies, setHorrorMovies] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [romanceMovies, setRomanceMovies] = useState([]);
  const [kidsContent, setKidsContent] = useState([]);
  const [myListContent, setMyListContent] = useState([]);
  
  // UI state
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Profile state
  const [currentProfile, setCurrentProfile] = useState(null);
  const [showProfileSelection, setShowProfileSelection] = useState(true);
  
  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    // Check if user has selected a profile before
    const savedProfile = ProfileStorage.getCurrentProfile();
    if (savedProfile) {
      setCurrentProfile(savedProfile);
      setShowProfileSelection(false);
      loadContent();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentProfile) {
      loadMyListContent();
    }
  }, [currentProfile]);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Fetch different categories of content
      const [
        trending,
        popular,
        action,
        comedy,
        docs,
        horror,
        scifi,
        romance,
        kids
      ] = await Promise.all([
        fetchFromTMDB('/trending/all/week'),
        fetchFromTMDB('/tv/popular'),
        fetchFromTMDB('/discover/movie?with_genres=28'), // Action
        fetchFromTMDB('/discover/movie?with_genres=35'), // Comedy
        fetchFromTMDB('/discover/movie?with_genres=99'), // Documentary
        fetchFromTMDB('/discover/movie?with_genres=27'), // Horror
        fetchFromTMDB('/discover/movie?with_genres=878'), // Sci-Fi
        fetchFromTMDB('/discover/movie?with_genres=10749'), // Romance
        fetchFromTMDB('/discover/movie?with_genres=16') // Animation/Kids
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
      setHorrorMovies(horror.results || []);
      setSciFiMovies(scifi.results || []);
      setRomanceMovies(romance.results || []);
      setKidsContent(kids.results || []);
      
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyListContent = () => {
    if (currentProfile) {
      const profile = ProfileStorage.getCurrentProfile();
      setMyListContent(profile.myList || []);
    }
  };

  const handleProfileSelect = (profile) => {
    setCurrentProfile(profile);
    ProfileStorage.setCurrentProfile(profile.id);
    setShowProfileSelection(false);
    loadContent();
  };

  const handleProfileClick = () => {
    setShowProfileSelection(true);
  };

  const handleSearchClick = () => {
    setIsSearchOpen(true);
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

  const handleAddToList = (content) => {
    if (!currentProfile || !content) return;
    
    const isInList = ProfileStorage.isInMyList(currentProfile.id, content.id);
    
    if (isInList) {
      ProfileStorage.removeFromMyList(currentProfile.id, content.id);
    } else {
      ProfileStorage.addToMyList(currentProfile.id, content);
    }
    
    // Refresh my list content
    loadMyListContent();
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
          <div className="text-white text-xl">Loading amazing content...</div>
        </div>
      </div>
    );
  }

  if (showProfileSelection) {
    return (
      <ProfileSelection
        onProfileSelect={handleProfileSelect}
        onClose={() => setShowProfileSelection(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <NetflixHeader 
        currentProfile={currentProfile}
        onProfileClick={handleProfileClick}
        onSearchClick={handleSearchClick}
      />
      
      <main>
        <HeroSection 
          featuredContent={featuredContent}
          onPlayTrailer={handlePlayTrailer}
          currentProfile={currentProfile}
          onAddToList={handleAddToList}
        />
        
        <div className="relative z-10 -mt-32 space-y-12">
          {myListContent.length > 0 && (
            <ContentRow
              title="My List"
              items={myListContent}
              onItemClick={handleContentClick}
              currentProfile={currentProfile}
              onAddToList={handleAddToList}
            />
          )}
          
          <ContentRow
            title="Trending Now"
            items={trendingMovies.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Popular on Netflix"
            items={popularSeries.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Action & Adventure"
            items={actionMovies.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Horror Movies"
            items={horrorMovies.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Sci-Fi & Fantasy"
            items={sciFiMovies.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Romance Movies"
            items={romanceMovies.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Comedy Movies"
            items={comedyMovies.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Kids & Family"
            items={kidsContent.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
          
          <ContentRow
            title="Documentaries"
            items={documentaries.slice(0, 15)}
            onItemClick={handleContentClick}
            currentProfile={currentProfile}
            onAddToList={handleAddToList}
          />
        </div>
      </main>
      
      <ContentModal
        isOpen={isModalOpen}
        onClose={closeModal}
        content={modalContent}
        trailerKey={trailerKey}
        currentProfile={currentProfile}
        onAddToList={handleAddToList}
      />
      
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onContentClick={handleContentClick}
      />
    </div>
  );
}

export default App;
