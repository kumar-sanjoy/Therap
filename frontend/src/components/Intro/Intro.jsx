import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import Testimonials from './Testimonials';
import Pricing from './Pricing';
import Footer from './Footer';
import flowLogo from '../../assets/flow-main-nobg.png';

const Intro = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white text-[#343434]">
      <Header logo={flowLogo} />
      <Hero navigate={navigate} />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Intro;