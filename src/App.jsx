// App.js or main App file

import React, { useState, useEffect, useContext } from 'react';
import ReactGA from 'react-ga4';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LiveLocation from './components/LiveLocation';
import ParkingSpaces from './components/ParkingSpaces';
import ProcessionRoute from './components/ProcessionRoute';
import PhotoGallery from './components/PhotoGallery';
import ContactPage from './components/ContactPage';
import LiveViwingSpaces from './components/LiveViwingSpaces';
import ImportentPlaces from './components/ImportentPlaces';
import SpecialAnnouncements from './components/SpecialAnnouncements';

ReactGA.initialize('G-DMVD7BQXK1');

const RouterContext = React.createContext();

const RouterProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
    ReactGA.send({ hitType: 'pageview', page: path });
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);
      ReactGA.send({ hitType: 'pageview', page: path });
    };

    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ currentPath, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};

const Route = ({ path, component: Component }) => {
  const { currentPath, navigate } = useRouter();
  return currentPath === path ? <Component navigate={navigate} /> : null;
};

const Routes = ({ children }) => {
  return <>{children}</>;
};

const Layout = ({ children }) => {
  useEffect(() => {
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

const App = () => {
  const { currentPath, navigate } = useRouter();

  return (
    <Layout>
      <Navbar currentPath={currentPath} navigate={navigate} />
      <main className="pt-20">
        <Routes>
          <Route path="/" component={HomePage} />
          {/* <Route path="/live" component={LiveLocation} /> */}
          <Route path="/parking" component={ParkingSpaces} />
          {/* <Route path="/announcements" component={SpecialAnnouncements} /> */}
          <Route path="/route" component={ProcessionRoute} />
          <Route path="/spaces" component={LiveViwingSpaces} />
          <Route path="/importent" component={ImportentPlaces} />
          {/* <Route path="/gallery" component={PhotoGallery} /> */}
          <Route path="/contact" component={ContactPage} />
        </Routes>
      </main>
      <Footer />
    </Layout>
  );
};

const AppWithRouter = () => (
  <RouterProvider>
    <App />
  </RouterProvider>
);

export default AppWithRouter;
