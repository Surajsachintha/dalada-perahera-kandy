import React from 'react';

const FestivalGuide = () => (
  <section className="py-16 bg-gray-900 min-h-screen">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Festival Guide
        </h2>
        <p className="text-gray-400 text-lg">History, significance and traditions</p>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">Significance</h3>
          <p className="text-gray-300 leading-relaxed">
            The festival is held to seek blessings for the nation and its people, to ensure abundant 
            harvests, and to maintain the Buddhist faith. The procession represents the ancient 
            ceremony of carrying the Sacred Tooth Relic for public veneration.
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">Traditions</h3>
          <p className="text-gray-300 leading-relaxed">
            The festival features elaborately decorated elephants, traditional dancers, drummers, 
            and torch-bearers. The majestic tusker elephant carries the golden casket containing 
            the Sacred Tooth Relic, while thousands of devotees and visitors witness this 
            spectacular procession.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default FestivalGuide;