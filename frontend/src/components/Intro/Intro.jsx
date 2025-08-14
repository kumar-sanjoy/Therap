import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Hero from './Hero';
import Features from './Features';
import Testimonials from './Testimonials';
import Pricing from './Pricing';
import Footer from './Footer';
import '../../css/IntroDesign.css';
import flowLogo from '../../assets/flow-main-nobg.png';
import flowLogoDark from '../../assets/flow-dark.png';
import { useDarkTheme } from '../DarkThemeProvider';

const Intro = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkTheme();
  
  return (
    <div className={`intro-page ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-[#343434]'}`}>
      <Header logo={isDarkMode ? flowLogoDark : flowLogo} />
      <Hero navigate={navigate} />
      <Features />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Intro;