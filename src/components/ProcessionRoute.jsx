import React from 'react';

const ProcessionRoute = () => (
  <section className="py-16 bg-gray-900 min-h-screen">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Procession Route
        </h2>
        <p className="text-gray-400 text-lg">Sacred path through the historic city of Kandy</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
          <div className="space-y-6">
            {[
              { location: "Temple of the Tooth", description: "Starting point - Sacred Tooth Relic", time: "7:00 PM" },
              { location: "Dalada Veediya", description: "Main procession street", time: "7:30 PM" },
              { location: "Adahana Maluwa", description: "Sacred square", time: "8:00 PM" },
              { location: "Kotugodella Veediya", description: "Historic street", time: "8:30 PM" },
              { location: "D.S. Senanayake Veediya", description: "Main thoroughfare", time: "9:00 PM" },
              { location: "Yatinuwara Veediya", description: "Return path", time: "9:30 PM" },
              { location: "Temple of the Tooth", description: "Return to starting point", time: "10:00 PM" }
            ].map((stop, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{stop.location}</h3>
                  <p className="text-gray-400">{stop.description}</p>
                </div>
                <div className="text-yellow-400 font-medium">{stop.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default ProcessionRoute;