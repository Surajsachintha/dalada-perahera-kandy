import React, { useState, useEffect } from 'react';
import { Bell, Calendar, Clock, ChevronDown, ChevronUp, Newspaper, RefreshCw, AlertCircle } from 'lucide-react';

const SpecialAnnouncements = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNews, setExpandedNews] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch news from API
  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://beautyme.lk:4599/json/announcements');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNews(data.filter(item => item.status === 1)); // Only show active news
      setError(null);
    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh news
  const refreshNews = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const toggleNews = (id) => {
    setExpandedNews(expandedNews === id ? null : id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const truncateText = (text, maxLength = 200) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-medium">Error Occurred</p>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* News Count */}
        <div className="mb-6">
          <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-yellow-400" />
              <span className="text-gray-300">Total Announcements: {news.length}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleTimeString('en-US')}
              </div>
              <button
                onClick={refreshNews}
                disabled={refreshing}
                className="flex items-center space-x-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* News List */}
        {news.length === 0 ? (
          <div className="text-center py-16">
            <Newspaper className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No Announcements</h3>
            <p className="text-gray-500">There are currently no announcements. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item) => (
              <article
                key={item.id}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-300 overflow-hidden"
              >
                {/* News Header */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleNews(item.id)}
                >
                  <div className="flex items-start space-x-4">
                    {/* News Icon */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-6 h-6 text-gray-900" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Meta Information */}
                      <div className="flex items-center space-x-4 mb-3 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(item.news_time)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(item.news_time)}</span>
                        </div>
                      </div>
                      
                      {/* Headline */}
                      <h2 className="text-lg md:text-xl font-bold text-white mb-3 leading-relaxed">
                        {item.news_heading}
                      </h2>
                      
                      {/* Summary */}
                      <div className="text-gray-300 text-sm leading-relaxed">
                        {expandedNews === item.id ? (
                          <div className="whitespace-pre-line">{item.news_body}</div>
                        ) : (
                          <div>{truncateText(item.news_body)}</div>
                        )}
                      </div>
                      
                      {/* Expand/Collapse Button */}
                      {item.news_body.length > 200 && (
                        <div className="flex items-center justify-end mt-4">
                          <div className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors">
                            <span className="text-sm mr-2">
                              {expandedNews === item.id ? 'Show Less' : 'Read More'}
                            </span>
                            {expandedNews === item.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Media Content */}
                {(item.image_url || item.video_url) && (
                  <div className="px-6 pb-6">
                    {item.image_url && (
                      <div className="rounded-lg overflow-hidden">
                        <img
                          src={item.image_url}
                          alt={item.news_heading}
                          className="w-full h-48 md:h-64 object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    {item.video_url && (
                      <div className="rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-48 md:h-64"
                          poster={item.image_url}
                        >
                          <source src={item.video_url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SpecialAnnouncements;