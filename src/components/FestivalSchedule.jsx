import React from 'react';

const FestivalSchedule = () => (
  <section className="py-16 bg-gray-900 min-h-screen">
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Festival Schedule
        </h2>
        <p className="text-gray-400 text-lg">Complete schedule of Dalada Perahara ceremonies</p>
      </div>
      
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {[
            { day: "Day 1", date: "August 12, 2025", events: ["Kap Situveema", "Temple Preparations", "Opening Ceremony"] },
            { day: "Day 2-6", date: "August 13-17, 2025", events: ["Kumbal Perahara", "Practice Processions", "Cultural Performances"] },
            { day: "Day 7-11", date: "August 18-22, 2025", events: ["Randoli Perahara", "Grand Processions", "Traditional Dances"] },
            { day: "Final Day", date: "August 23, 2025", events: ["Diya Kepeema", "Water Cutting Ceremony", "Closing Rituals"] }
          ].map((schedule, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-xl font-bold text-yellow-400">{schedule.day}</h3>
                <span className="text-gray-400">{schedule.date}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {schedule.events.map((event, eventIndex) => (
                  <div key={eventIndex} className="bg-gray-700 rounded-lg p-4">
                    <p className="text-white font-medium">{event}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default FestivalSchedule;