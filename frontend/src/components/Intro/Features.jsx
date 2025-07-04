import React from 'react';
import { FaBrain, FaChartLine, FaUsers } from 'react-icons/fa';

const features = [
  {
    title: "AI-Powered Learning",
    description: "Personalized quizzes and assignments for every student with adaptive difficulty scaling.",
    icon: <FaBrain className="text-purple-600" size={45} />,
    iconColor: "text-purple-600"
  },
  {
    title: "Teacher Insights",
    description: "Real-time analytics to identify class trends and individual student needs.",
    icon: <FaChartLine className="text-blue-600" size={45} />,
    iconColor: "text-blue-600"
  },
  {
    title: "Collaborative Tools",
    description: "Seamless integration with classroom workflows and existing platforms.",
    icon: <FaUsers className="text-green-600" size={45} />,
    iconColor: "text-green-600"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="text-transparent bg-clip-text animated-gradient-text font-lobster">Flow </span> Wins in Classrooms
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transforming classrooms with intelligent, data-driven education tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group overflow-hidden"
            >
              {/* Static gradient from top-left to bottom-right */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-[#343434]/5 to-transparent z-0"
              />
              
              {/* Animated hover gradient */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-[#343434]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
              />

              <div className="relative z-10">
                <div className={`mb-4 p-3 rounded-full w-16 h-16 flex items-center justify-center ${feature.iconColor} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#343434] mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;