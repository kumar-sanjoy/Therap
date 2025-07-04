import React from 'react';

const Hero = ({ navigate }) => {
  return (
    <section className="relative bg-white py-16 md:py-24 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-72 bg-gradient-to-b from-gray-50 to-white -z-10"></div>
      
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-12 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            <span className="text-[#343434] font-serif-text">Empower Every Student</span>
            <br />
            <span className="text-transparent font-serif-text bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">
              With Personalized Learning
            </span>
          </h1>
          
          <p className="text-lg text-gray-700 mb-8 max-w-lg">
            Flow uses AI to bridge the gap between what students need and what teachers can provide — guiding each learner with customized paths and real-time insights.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-3 bg-[#343434] text-white font-semibold rounded-lg hover:bg-gray-800 transition shadow-md hover:shadow-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="px-6 py-3 border-2 border-[#343434] text-[#343434] font-bold rounded-lg hover:bg-gray-50 transition"
            >
              See Demo
            </button>
          </div>
        </div>
        
        <div className="md:w-1/2 relative">
          <div className="relative bg-white p-1 rounded-xl shadow-xl border border-gray-100">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl blur opacity-20"></div>
            <div className="relative bg-white rounded-lg overflow-hidden h-80">
              {/* Replace with your actual hero image */}
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">Dashboard Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;