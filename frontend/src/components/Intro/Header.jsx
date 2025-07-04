import { useNavigate } from 'react-router-dom';

const Header = ({ logo }) => {

  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white px-6 py-3 flex justify-between items-center shadow-sm border-b border-gray-100">
      <div className="flex items-center space-x-3">
        <img 
          src={logo} 
          alt="Flow Logo" 
          className="h-10 w-auto transition-all duration-300 hover:scale-105" 
        />
        
      </div>
      <nav className="flex items-center space-x-6">
        <a href="#features" className="text-[#343434] hover:text-gray-600 font-medium text-sm hidden md:block">Features</a>
        {/* <a href="#testimonials" className="text-[#343434] hover:text-gray-600 font-medium text-sm hidden md:block">Testimonials</a> */}
        <button
        onClick={() => navigate('/login')} 
        className="px-5 py-2 bg-[#343434] text-white rounded-md hover:bg-white hover:text-black transition-all font-medium text-sm shadow-sm hover:border hover:border-[#343434]">
          Login / Signup
        </button>
      </nav>
    </header>
  );
};

export default Header;