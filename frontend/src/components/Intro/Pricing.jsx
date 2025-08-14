import React, { useState } from 'react';
import { FaCheck, FaStar, FaUsers, FaGraduationCap, FaRocket, FaCrown } from 'react-icons/fa';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Starter",
      icon: <FaGraduationCap className="text-3xl" />,
      price: isAnnual ? 9 : 12,
      description: "Perfect for individual teachers and small classes",
      features: [
        "Up to 50 students",
        "Basic AI learning paths",
        "Standard analytics",
        "Email support",
        "5 subjects",
        "Basic assessment tools"
      ],
      popular: false,
      color: "from-blue-500 to-blue-600"
    },
    {
      name: "Professional",
      icon: <FaUsers className="text-3xl" />,
      price: isAnnual ? 29 : 39,
      description: "Ideal for schools and larger educational institutions",
      features: [
        "Up to 500 students",
        "Advanced AI personalization",
        "Comprehensive analytics",
        "Priority support",
        "Unlimited subjects",
        "Advanced assessment tools",
        "Collaborative features",
        "Progress tracking"
      ],
      popular: true,
      color: "from-purple-500 to-purple-600"
    },
    {
      name: "Enterprise",
      icon: <FaCrown className="text-3xl" />,
      price: isAnnual ? 99 : 129,
      description: "For large districts and universities",
      features: [
        "Unlimited students",
        "Custom AI models",
        "Advanced reporting",
        "Dedicated support",
        "Custom integrations",
        "White-label options",
        "API access",
        "Custom training"
      ],
      popular: false,
      color: "from-gray-700 to-gray-800"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-700 rounded-full text-sm font-medium mb-6">
            <FaStar className="mr-2" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Choose the Perfect Plan
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 block">
              for Your Needs
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Start free and scale as you grow. All plans include our core AI-powered features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                isAnnual ? 'bg-purple-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
              <span className="ml-1 text-green-600 font-bold">Save 25%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-purple-500 scale-105' 
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${plan.color} text-white mb-4`}>
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#343434] mb-2">{plan.name}</h3>
                  <p className="text-gray-600">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-8">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-[#343434]">${plan.price}</span>
                    <span className="text-gray-500 ml-2">/month</span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                      Billed annually (${plan.price * 12})
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <FaCheck className="text-green-600 text-xs" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:shadow-lg transform hover:-translate-y-1'
                      : 'bg-gray-100 text-[#343434] hover:bg-gray-200'
                  }`}
                >
                  {plan.popular ? 'Start Free Trial' : 'Get Started'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#343434] mb-3">Can I change plans anytime?</h4>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#343434] mb-3">Is there a free trial?</h4>
              <p className="text-gray-600">Yes! All plans come with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#343434] mb-3">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for annual plans.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-semibold text-[#343434] mb-3">Do you offer discounts for schools?</h4>
              <p className="text-gray-600">Yes! We offer special pricing for educational institutions. Contact us for details.</p>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-[#343434] to-gray-800 rounded-3xl p-8 md:p-12 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-6">
              Need a Custom Solution?
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              We work with large institutions to create tailored solutions that meet your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-[#343434] font-semibold rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2">
                <FaRocket />
                <span>Contact Sales</span>
              </button>
              <button className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-[#343434] transition-all duration-300">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 