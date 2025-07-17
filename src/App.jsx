import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LiveLocation from './components/LiveLocation';
import ParkingSpaces from './components/ParkingSpaces';
import FestivalSchedule from './components/FestivalSchedule';
import ProcessionRoute from './components/ProcessionRoute';
import CulturalEvents from './components/CulturalEvents';
import FestivalGuide from './components/FestivalGuide';
import PhotoGallery from './components/PhotoGallery';
import ContactPage from './components/ContactPage';

// Custom Router Context
const RouterContext = React.createContext();

// Custom Router Provider
const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');

  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

// Custom useRouter hook
const useRouter = () => {
  const context = React.useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

// Route Component
const Route = ({ path, component: Component }) => {
  const { currentPath, navigate } = useRouter();
  return currentPath === path ? <Component navigate={navigate} /> : null;
};

// Routes Component
const Routes = ({ children }) => {
  return <>{children}</>;
};

// Layout Component
const Layout = ({ children }) => {
  // Add scrollbar hide styles to document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {children}
    </div>
  );
};

// Main App Component
const App = () => {
  const { currentPath, navigate } = useRouter();

  return (
    <Layout>
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="pt-20">
        <Routes>
          <Route path="/" component={HomePage} />
          <Route path="/live" component={LiveLocation} />
          <Route path="/parking" component={ParkingSpaces} />
          <Route path="/schedule" component={FestivalSchedule} />
          <Route path="/route" component={ProcessionRoute} />
          <Route path="/events" component={CulturalEvents} />
          <Route path="/guide" component={FestivalGuide} />
          <Route path="/gallery" component={PhotoGallery} />
          <Route path="/contact" component={ContactPage} />
        </Routes>
      </main>
      <Footer />
    </Layout>
  );
};

// Root Component with Router Provider
const AppWithRouter = () => (
  <RouterProvider>
    <App />
  </RouterProvider>
);

export default AppWithRouter;