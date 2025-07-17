import React from 'react';
import { Clock } from 'lucide-react';

const CulturalEvents = () => (
  <section className="py-16 bg-gray-900 min-h-screen">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Cultural Events
        </h2>
        <p className="text-gray-400 text-lg">Traditional performances and cultural activities</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Kandyan Dancing", description: "Traditional Sri Lankan classical dance", time: "6:00 PM Daily" },
          { title: "Gatabera Drumming", description: "Sacred drum performances", time: "7:00 PM Daily" },
          { title: "Fire Dancing", description: "Spectacular fire performances", time: "8:00 PM Daily" },
          { title: "Whip Cracking", description: "Traditional whip demonstrations", time: "8:30 PM Daily" },
          { title: "Stilt Walking", description: "Traditional stilt performers", time: "9:00 PM Daily" },
          { title: "Peacock Dance", description: "Elegant peacock-themed dance", time: "9:30 PM Daily" }
        ].map((event, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-yellow-400 transition-colors">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">{event.title}</h3>
            <p className="text-gray-300 mb-4">{event.description}</p>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-sm">{event.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CulturalEvents;