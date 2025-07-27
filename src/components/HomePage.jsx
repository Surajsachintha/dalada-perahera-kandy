import React from 'react';
import { ChevronRight, Navigation, Users, Car, Info, ScrollText, Clock, Phone } from 'lucide-react';

const HomePage = ({ navigate = () => {} }) => {
  const cards = [
      // {
      //   id: 1,
      //   title: "Live Perahera Route",
      //   description: "Track the real-time procession route and schedule of the Dalada Perahera festival.",
      //   icon: <Navigation className="w-8 h-8" />,
      //   color: "from-blue-600 to-blue-800",
      //   featured: true,
      //   path: '/live'
      // },
      {
        id: 2,
        title: "Live Viewing Spaces",
        description: "Check available spaces along the procession path to watch cultural performances and rituals.",
        icon: <Users className="w-8 h-8" />,
        color: "from-green-600 to-green-800",
        path: '/spaces'
      },
      {
        id: 3,
        title: "Live Parking Availability",
        description: "View real-time parking space availability during the Perahera festival.",
        icon: <Car className="w-8 h-8" />,
        color: "from-purple-600 to-purple-800",
        path: '/parking'
      },
      {
        id: 4,
        title: "Important Places",
        description: "Explore key locations, historical landmarks, and sites of cultural significance.",
        icon: <Info className="w-8 h-8" />,
        color: "from-orange-600 to-orange-800",
        path: '/importent'
      },
      // {
      //   id: 5,
      //   title: "Special Announcements",
      //   description: "Stay updated with important festival notices and public announcements.",
      //   icon: <ScrollText className="w-8 h-8" />,
      //   color: "from-pink-600 to-pink-800",
      //   path: '/announcements'
      // },
      {
        id: 6,
        title: "Daily Perahera Route",
        description: "Get the daily updated route and schedule of the ongoing Perahera processions.",
        icon: <Clock className="w-8 h-8" />,
        color: "from-red-600 to-red-800",
        path: '/route'
      },
      {
        id: 7,
        title: "Contact Information",
        description: "Get the daily updated route and schedule of the ongoing Perahera processions.",
        icon: <Phone className="w-8 h-8" />,
        color: "from-red-600 to-red-800",
        path: '/contact'
      }
  ];

  return (
    <div className="min-h-screen relative flex items-center py-1">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://lk.lakpura.com/cdn/shop/files/LK94909139-11-E.jpg?v=1689676827&width=3840')`
        }}
      ></div>
      
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black opacity-70"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10"></div>
      <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center">
        <div className="text-center mb-4">
          {/* <h3 className="text-3xl font-bold text-white mb-4">Festival Information</h3> */}
          {/* <p className="text-gray-400 text-lg">Everything you need to know about the sacred celebration</p> */}
        </div>

        {/* Cards Grid - Centered layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group`}
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
    </div>
  );
};

export default HomePage;