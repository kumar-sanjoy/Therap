import React from 'react';
import { FaBrain, FaChartLine, FaUsers, FaRobot, FaGraduationCap, FaShieldAlt, FaMobile, FaClock } from 'react-icons/fa';

const features = [
  {
    title: "AI-Powered Personalization",
    description: "Our advanced AI creates unique learning paths for each student, adapting difficulty and content based on individual progress and learning style.",
    icon: <FaBrain className="text-purple-600" size={45} />,
    iconColor: "text-purple-600",
    bgColor: "from-purple-50 to-purple-100",
    stats: "95% accuracy in learning path recommendations"
  },
  {
    title: "Real-Time Analytics Dashboard",
    description: "Comprehensive insights into student performance, class trends, and learning gaps with actionable recommendations for teachers.",
    icon: <FaChartLine className="text-blue-600" size={45} />,
    iconColor: "text-blue-600",
    bgColor: "from-blue-50 to-blue-100",
    stats: "Real-time data updates every 30 seconds"
  },
  {
    title: "Smart Assessment Engine",
    description: "Automated quiz generation, instant grading, and detailed feedback with explanations for every answer choice.",
    icon: <FaRobot className="text-green-600" size={45} />,
    iconColor: "text-green-600",
    bgColor: "from-green-50 to-green-100",
    stats: "1000+ question types supported"
  },
  {
    title: "Collaborative Learning Tools",
    description: "Group projects, peer reviews, and interactive discussions that foster teamwork and critical thinking skills.",
    icon: <FaUsers className="text-orange-600" size={45} />,
    iconColor: "text-orange-600",
    bgColor: "from-orange-50 to-orange-100",
    stats: "Support for unlimited group sizes"
  },
  {
    title: "Progress Tracking & Certificates",
    description: "Comprehensive progress reports, achievement badges, and printable certificates to motivate and recognize student accomplishments.",
    icon: <FaGraduationCap className="text-indigo-600" size={45} />,
    iconColor: "text-indigo-600",
    bgColor: "from-indigo-50 to-indigo-100",
    stats: "50+ achievement badges available"
  },
  {
    title: "Secure & Compliant",
    description: "Enterprise-grade security with FERPA compliance, data encryption, and regular security audits to protect student privacy.",
    icon: <FaShieldAlt className="text-red-600" size={45} />,
    iconColor: "text-red-600",
    bgColor: "from-red-50 to-red-100",
    stats: "99.9% uptime guarantee"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium mb-6">
            <FaBrain className="mr-2" />
            Powered by Advanced AI
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 block">
              Transform Your Classroom
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From personalized learning paths to comprehensive analytics, Flow provides all the tools 
            educators need to create engaging, effective learning experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group overflow-hidden transform hover:-translate-y-2"
            >
              {/* Background gradient */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`mb-6 p-4 rounded-2xl w-20 h-20 flex items-center justify-center bg-white shadow-lg group-hover:shadow-xl transition-all duration-300 ${feature.iconColor} bg-opacity-10`}>
                  {feature.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-[#343434] mb-4 group-hover:text-gray-800 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Stats */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FaClock className="text-gray-400" />
                  <span>{feature.stats}</span>
                </div>
              </div>
              
              {/* Hover effect */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* Additional Benefits Section */}
        <div className="bg-gradient-to-r from-[#343434] to-gray-800 rounded-3xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Why Educators Choose Flow
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-lg">Save 10+ hours per week on grading</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-lg">Improve student engagement by 40%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-lg">Reduce learning gaps by 60%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">✓</span>
                  </div>
                  <span className="text-lg">Works on any device, anywhere</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center space-x-4 mb-4">
                  <FaMobile className="text-3xl text-blue-400" />
                  <div>
                    <h4 className="font-bold text-lg">Mobile-First Design</h4>
                    <p className="text-gray-300">Access from any device</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">iOS App</span>
                    <span className="text-green-400">✓ Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Android App</span>
                    <span className="text-green-400">✓ Available</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Web Platform</span>
                    <span className="text-green-400">✓ Responsive</span>
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

export default Features;