import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaChevronDown, FaGraduationCap, FaUsers, FaBook, FaChartLine } from 'react-icons/fa';
import { useState, useEffect } from 'react';

const Header = ({ logo }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDropdownToggle = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const featuresDropdown = [
    { name: "AI Learning", icon: <FaGraduationCap />, href: "#features" },
    { name: "Analytics", icon: <FaChartLine />, href: "#features" },
    { name: "Collaboration", icon: <FaUsers />, href: "#features" },
    { name: "Content Library", icon: <FaBook />, href: "#features" }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/98 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100'
    }`}>
      <div className="px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src={logo} 
            alt="Flow Logo" 
            className={`transition-all duration-300 hover:scale-105 cursor-pointer ${
              isScrolled ? 'h-8' : 'h-10'
            }`}
            onClick={() => navigate('/')}
          />
          
          
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {/* Features Dropdown */}
          <div className="relative group">
            <button
              onClick={() => handleDropdownToggle('features')}
              className="flex items-center space-x-1 text-[#343434] hover:text-purple-600 font-medium text-sm transition-colors duration-300 py-2"
            >
              <span>Features</span>
              <FaChevronDown className={`transition-transform duration-300 ${activeDropdown === 'features' ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Platform Features</div>
                {featuresDropdown.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 group/item"
                  >
                    <div className="text-purple-600 group-hover/item:scale-110 transition-transform duration-200">
                      {item.icon}
                    </div>
                    <div>
                      <div className="font-medium text-[#343434] group-hover/item:text-purple-600 transition-colors duration-200">
                        {item.name}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <a 
            href="#pricing" 
            className="text-[#343434] hover:text-purple-600 font-medium text-sm transition-colors duration-300 relative group"
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>
          
          <a 
            href="#testimonials" 
            className="text-[#343434] hover:text-purple-600 font-medium text-sm transition-colors duration-300 relative group"
          >
            Testimonials
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 group-hover:w-full transition-all duration-300"></span>
          </a>

          {/* CTA Buttons */}
          <div className="flex items-center space-x-4 ml-4">
            <button
              onClick={() => navigate('/login')} 
              className="px-6 py-2.5 bg-gradient-to-r from-[#343434] to-gray-700 text-white rounded-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm flex items-center space-x-2"
            >
              <FaGraduationCap className="text-sm" />
              <span>Get Started</span>
            </button>
            <button
              onClick={() => navigate('/login')} 
              className="px-6 py-2.5 border-2 border-[#343434] text-[#343434] rounded-lg hover:bg-[#343434] hover:text-white transition-all duration-300 font-medium text-sm"
            >
              Sign In
            </button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes className="text-[#343434]" /> : <FaBars className="text-[#343434]" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-6 py-4 space-y-4">
            {/* Features Section */}
            <div>
              <button
                onClick={() => handleDropdownToggle('mobile-features')}
                className="flex items-center justify-between w-full text-[#343434] hover:text-purple-600 font-medium py-2 transition-colors duration-300"
              >
                <span>Features</span>
                <FaChevronDown className={`transition-transform duration-300 ${activeDropdown === 'mobile-features' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'mobile-features' && (
                <div className="ml-4 mt-2 space-y-2">
                  {featuresDropdown.map((item, index) => (
                    <a
                      key={index}
                      href={item.href}
                      className="flex items-center space-x-3 py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <a 
              href="#pricing" 
              className="block text-[#343434] hover:text-purple-600 font-medium py-2 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </a>
            
            <a 
              href="#testimonials" 
              className="block text-[#343434] hover:text-purple-600 font-medium py-2 transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>

            {/* Mobile CTA Buttons */}
            <div className="pt-4 space-y-3 border-t border-gray-100">
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }} 
                className="w-full px-6 py-3 bg-gradient-to-r from-[#343434] to-gray-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium flex items-center justify-center space-x-2"
              >
                <FaGraduationCap />
                <span>Get Started</span>
              </button>
              <button
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }} 
                className="w-full px-6 py-3 border-2 border-[#343434] text-[#343434] rounded-lg hover:bg-[#343434] hover:text-white transition-all duration-300 font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;