import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

const ContactPage = () => {
  return (
    <section className="py-16 bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4">
        {/* <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Contact Us
          </h2>
          <p className="text-gray-400 text-lg">Get in touch for more information about the Dalada Perahera Festival</p>
        </div> */}
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-8">
            {/* Contact Information */}
            <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
              <h3 className="text-2xl font-bold text-yellow-400 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Temple of the Sacred Tooth Relic</p>
                    <p className="text-gray-400">Sri Dalada Veediya, Kandy 20000, Sri Lanka</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <a 
                      href="tel:+94776681006" 
                      className="text-white font-medium hover:text-yellow-400 transition-colors duration-200"
                    >
                      +94 77 668 1006
                    </a>
                    <p className="text-gray-400">Festival Information & Inquiries</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MessageCircle className="w-6 h-6 text-green-400 mt-1 flex-shrink-0" />
                  <div>
                    <a 
                      href="https://wa.me/94776681006" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium hover:text-green-400 transition-colors duration-200 inline-flex items-center gap-2"
                    >
                      Live Chat
                      <span className="text-green-400 text-sm">(WhatsApp)</span>
                    </a>
                    <p className="text-gray-400">Quick Festival Updates & Support</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <a 
                      href="mailto:info@dalada-perahera.lk" 
                      className="text-white font-medium hover:text-yellow-400 transition-colors duration-200"
                    >
                      info@dalada-perahera.lk
                    </a>
                    <p className="text-gray-400">General Inquiries</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">Festival Hours</p>
                    <p className="text-gray-400">24 Hours During Festival Time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;