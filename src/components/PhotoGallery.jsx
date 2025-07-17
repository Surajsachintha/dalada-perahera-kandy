import React from 'react';
import { Camera } from 'lucide-react';

const PhotoGallery = () => (
  <section className="py-16 bg-gray-900 min-h-screen">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Photo Gallery
        </h2>
        <p className="text-gray-400 text-lg">Beautiful moments from previous festivals</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-400 transition-colors group">
            <div className="aspect-video bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-900 group-hover:scale-110 transition-transform" />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-white mb-2">Festival Moment {index + 1}</h3>
              <p className="text-gray-400 text-sm">Beautiful capture from the sacred procession</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PhotoGallery;