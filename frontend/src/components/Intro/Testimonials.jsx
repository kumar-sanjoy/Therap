import React from 'react';
import { FaStar, FaQuoteLeft, FaGraduationCap, FaChalkboardTeacher } from 'react-icons/fa';

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "High School Math Teacher",
    school: "Lincoln High School",
    avatar: "SJ",
    rating: 5,
    content: "Flow has completely transformed how I teach. The AI-powered personalization means every student gets exactly what they need. My class average improved by 25% in just one semester!",
    stats: "Improved class average by 25%"
  },
  {
    name: "Dr. Michael Chen",
    role: "Science Department Head",
    school: "Riverside Academy",
    avatar: "MC",
    rating: 5,
    content: "The analytics dashboard is incredible. I can instantly see which students need help and what topics are challenging the class. It's like having a teaching assistant for every student.",
    stats: "Reduced grading time by 60%"
  },
  {
    name: "Emily Rodriguez",
    role: "Middle School English Teacher",
    school: "Maplewood Middle",
    avatar: "ER",
    rating: 5,
    content: "My students love the interactive quizzes and the instant feedback. The platform makes learning fun while providing me with detailed insights into their progress.",
    stats: "Increased student engagement by 40%"
  },
  {
    name: "James Wilson",
    role: "Elementary School Principal",
    school: "Oakwood Elementary",
    avatar: "JW",
    rating: 5,
    content: "As a principal, I need to see the big picture. Flow's comprehensive reporting helps me understand how our teachers are performing and where we can improve.",
    stats: "Improved school-wide test scores by 15%"
  },
  {
    name: "Lisa Thompson",
    role: "Special Education Teacher",
    school: "Sunshine Learning Center",
    avatar: "LT",
    rating: 5,
    content: "The adaptive learning paths are perfect for my special needs students. Each child gets a personalized experience that matches their learning pace and style.",
    stats: "Helped 90% of students meet IEP goals"
  },
  {
    name: "David Park",
    role: "College Professor",
    school: "State University",
    avatar: "DP",
    rating: 5,
    content: "Even at the college level, Flow's AI insights are invaluable. It helps me identify struggling students early and provide targeted support before it's too late.",
    stats: "Reduced dropout rate by 30%"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <FaQuoteLeft className="mr-2" />
            What Educators Say
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Trusted by
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 block">
              Educators Worldwide
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of teachers who have transformed their classrooms with Flow's AI-powered learning platform.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl md:text-4xl font-bold text-[#343434] mb-2">10,000+</div>
            <div className="text-gray-600">Active Teachers</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl md:text-4xl font-bold text-[#343434] mb-2">500,000+</div>
            <div className="text-gray-600">Students Served</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl md:text-4xl font-bold text-[#343434] mb-2">4.9/5</div>
            <div className="text-gray-600">Average Rating</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="text-3xl md:text-4xl font-bold text-[#343434] mb-2">95%</div>
            <div className="text-gray-600">Satisfaction Rate</div>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="mb-6">
                <FaQuoteLeft className="text-4xl text-purple-200" />
              </div>
              
              {/* Rating */}
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>
              
              {/* Stats */}
              <div className="mb-6 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-sm font-semibold text-purple-700">
                  {testimonial.stats}
                </div>
              </div>
              
              {/* Author */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#343434]">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                  <div className="text-xs text-gray-500">{testimonial.school}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#343434] to-gray-800 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Classroom?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of educators who are already using Flow to create better learning experiences for their students.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-[#343434] font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2">
                <FaGraduationCap />
                <span>Start Free Trial</span>
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-[#343434] transition-all duration-300 flex items-center justify-center space-x-2">
                <FaChalkboardTeacher />
                <span>Schedule Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 