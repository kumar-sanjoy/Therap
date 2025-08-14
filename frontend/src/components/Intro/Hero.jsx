import React from 'react';
import { FaPlay, FaStar, FaUsers, FaGraduationCap } from 'react-icons/fa';
import flowLogo from '../../assets/flow-dark.png';

const Hero = ({ navigate }) => {
  return (
    <section className="relative bg-gradient-to-br from-white via-gray-50 to-blue-50 py-16 md:py-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <FaStar className="mr-2 text-yellow-500" />
              Trusted by 10,000+ educators worldwide
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              <span className="text-[#343434]">Transform Learning</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600">
                With AI-Powered Education
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Flow bridges the gap between traditional teaching and modern learning needs. 
              Our AI-driven platform provides personalized learning paths, real-time insights, 
              and adaptive assessments for every student.
            </p>
            
            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start mb-8 space-x-6">
              <div className="flex items-center space-x-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full border-2 border-white"></div>
                  ))}
                </div>
                <span className="text-sm text-gray-600">500+ active teachers</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <FaStar className="text-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">4.9/5</span>
              </div>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-gradient-to-r from-[#343434] to-gray-700 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <FaGraduationCap />
                <span>Start Free Trial</span>
              </button>
              <button
                onClick={() => navigate('/demo')}
                className="px-8 py-4 border-2 border-[#343434] text-[#343434] font-semibold rounded-xl hover:bg-[#343434] hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <FaPlay className="group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
              <span>✓ No credit card required</span>
              <span>✓ 14-day free trial</span>
              <span>✓ Cancel anytime</span>
            </div>
          </div>
          
          {/* Right Content - Dashboard Preview */}
          <div className="lg:w-1/2 relative">
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <img src={flowLogo} alt="Flow" className="h-6" />
                    <span className="font-semibold text-gray-700">Flow Dashboard</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">85%</div>
                      <div className="text-sm text-blue-700">Class Average</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">24</div>
                      <div className="text-sm text-green-700">Active Students</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Sarah M. - Completed Chapter 3</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Mike R. - Needs help with Algebra</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">Emma L. - Quiz score: 92%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaUsers className="text-blue-500" />
                  <span className="text-sm font-medium">24 Students</span>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-500" />
                  <span className="text-sm font-medium">4.9 Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;