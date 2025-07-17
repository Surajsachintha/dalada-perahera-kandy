import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, MapPin, Users, Info, Camera, Menu, X, Home, Phone, Navigation, Car } from 'lucide-react';

const Navbar = ({ currentPath, navigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigationItems = [
    { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, path: '/' },
    { id: 'live', label: 'Live', icon: <Navigation className="w-4 h-4" />, path: '/live' },
    { id: 'parking', label: 'Parking', icon: <Car className="w-4 h-4" />, path: '/parking' },
    { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" />, path: '/schedule' },
    { id: 'route', label: 'Route', icon: <MapPin className="w-4 h-4" />, path: '/route' },
    { id: 'events', label: 'Events', icon: <Users className="w-4 h-4" />, path: '/events' },
    { id: 'guide', label: 'Guide', icon: <Info className="w-4 h-4" />, path: '/guide' },
    { id: 'gallery', label: 'Gallery', icon: <Camera className="w-4 h-4" />, path: '/gallery' },
    { id: 'contact', label: 'Contact', icon: <Phone className="w-4 h-4" />, path: '/contact' }
  ];

  const isActive = (path) => currentPath === path;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700/50 shadow-2xl' 
        : 'bg-gray-800/90 backdrop-blur-sm border-b border-gray-700'
    }`}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => handleNavigation('/')} 
            className="flex items-center space-x-3 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-lg group-hover:shadow-xl">
              <span className="text-gray-900 font-bold text-lg transition-transform duration-300 group-hover:scale-110">ශ්‍රී</span>
            </div>
            <div className="transform transition-all duration-300 group-hover:translate-x-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Sri Dalada Perahara
              </h1>
              <p className="text-gray-400 text-sm transition-colors duration-300 group-hover:text-gray-300">
                Sacred Festival of Kandy
              </p>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  {item.icon}
                </div>
                <span className="text-sm font-medium relative">
                  {item.label}
                  {!isActive(item.path) && (
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                  )}
                </span>
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 transform hover:scale-110 active:scale-95 group"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="relative w-6 h-6">
              <X className={`w-6 h-6 absolute inset-0 transition-all duration-300 transform ${
                isMobileMenuOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
              }`} />
              <Menu className={`w-6 h-6 absolute inset-0 transition-all duration-300 transform ${
                isMobileMenuOpen ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100'
              }`} />
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isMobileMenuOpen ? 'max-h-150 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <nav className="mt-4 pt-4 border-t border-gray-700/50">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: `all 0.3s ease-in-out ${index * 100}ms`
                  }}
                >
                  <div className="transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto transform transition-all duration-300 group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;