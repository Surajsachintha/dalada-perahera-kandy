import React from 'react';
import { ChevronRight, Calendar, MapPin, Users, Info, Camera, Clock } from 'lucide-react';

const HomePage = ({ navigate }) => {
  const cards = [
    {
      id: 1,
      title: "Festival Schedule",
      description: "View complete schedule of Dalada Perahara ceremonies and processions.",
      icon: <Calendar className="w-8 h-8" />,
      color: "from-blue-600 to-blue-800",
      featured: true,
      path: '/schedule'
    },
    {
      id: 2,
      title: "Procession Route",
      description: "Interactive map showing the sacred procession route through Kandy.",
      icon: <MapPin className="w-8 h-8" />,
      color: "from-purple-600 to-purple-800",
      path: '/route'
    },
    {
      id: 3,
      title: "Cultural Events",
      description: "Traditional dance performances, drumming sessions and cultural activities.",
      icon: <Users className="w-8 h-8" />,
      color: "from-green-600 to-green-800",
      path: '/events'
    },
    {
      id: 4,
      title: "Festival Guide",
      description: "Complete guide about the history, significance and traditions of the festival.",
      icon: <Info className="w-8 h-8" />,
      color: "from-orange-600 to-orange-800",
      path: '/guide'
    },
    {
      id: 5,
      title: "Photo Gallery",
      description: "Beautiful moments captured from previous Dalada Perahara festivals.",
      icon: <Camera className="w-8 h-8" />,
      color: "from-pink-600 to-pink-800",
      path: '/gallery'
    },
    {
      id: 6,
      title: "Live Updates",
      description: "Real-time updates and notifications during the festival period.",
      icon: <Clock className="w-8 h-8" />,
      color: "from-red-600 to-red-800",
      path: '/'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1544735716-392fe2489ffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        ></div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 z-20"></div>
        
        {/* Content */}
        <div className="relative z-30 h-full flex items-center justify-center">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-2xl">
                Welcome to Sri Dalada Perahara
              </h2>
              <p className="text-xl md:text-2xl text-white mb-8 leading-relaxed drop-shadow-lg font-light">
                Experience the grandeur of Sri Lanka's most sacred Buddhist festival. Join us in celebrating the magnificent procession honoring the Sacred Tooth Relic of Lord Buddha.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => navigate('/schedule')}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  View Schedule
                </button>
                <button 
                  onClick={() => navigate('/guide')}
                  className="px-8 py-4 border-2 border-white text-white font-bold rounded-full hover:bg-white hover:text-gray-900 transition-all duration-300 transform hover:scale-105 shadow-xl"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
          <div className="animate-bounce">
            <ChevronRight className="w-6 h-6 text-white transform rotate-90" />
          </div>
        </div>
      </section>

      {/* Cards Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Festival Information</h3>
            <p className="text-gray-400 text-lg">Everything you need to know about the sacred celebration</p>
          </div>

          {/* Mobile: Horizontal scroll, Desktop: Grid */}
          <div className="block md:hidden">
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {cards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => navigate(card.path)}
                  className={`flex-shrink-0 w-72 bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-white opacity-90 group-hover:opacity-100 transition-opacity">
                      {card.icon}
                    </div>
                    <ChevronRight className="w-6 h-6 text-white opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-3">{card.title}</h4>
                  <p className="text-white opacity-90 text-sm leading-relaxed">{card.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => navigate(card.path)}
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group ${
                  card.featured ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-white opacity-90 group-hover:opacity-100 transition-opacity">
                    {card.icon}
                  </div>
                  <ChevronRight className="w-6 h-6 text-white opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">{card.title}</h4>
                <p className="text-white opacity-90 text-sm leading-relaxed">{card.description}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-900" />
              </div>
              <h4 className="text-xl font-bold mb-2">Festival Dates</h4>
              <p className="text-gray-400">August 2025</p>
              <p className="text-sm text-gray-500 mt-2">Esala Poya Full Moon</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Location</h4>
              <p className="text-gray-400">Kandy, Sri Lanka</p>
              <p className="text-sm text-gray-500 mt-2">Temple of the Tooth</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold mb-2">Participants</h4>
              <p className="text-gray-400">Thousands of Devotees</p>
              <p className="text-sm text-gray-500 mt-2">Global Visitors Welcome</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;