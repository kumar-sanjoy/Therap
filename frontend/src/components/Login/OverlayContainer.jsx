import React from 'react';

const OverlayContainer = ({ isRightPanelActive, userRole, setIsRightPanelActive }) => {
  return (
    <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] z-[1] ${isRightPanelActive ? '-translate-x-full' : ''}`}>
      <div
        className={`relative -left-full h-full w-[200%] text-white transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          userRole === 'TEACHER' ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
        } ${isRightPanelActive ? 'translate-x-1/2' : ''}`}
      >
        <div
          className={`absolute flex flex-col items-center justify-center px-10 text-center h-full w-1/2 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            isRightPanelActive ? 'translate-x-0' : '-translate-x-[15%]'
          }`}
        >
          <h1 className="font-bold mb-4 text-3xl">Welcome Back!</h1>
          <p className="text-sm font-normal leading-5 tracking-wider my-5">
            To keep connected with us please login with your personal info
          </p>
          <button
            className="rounded-3xl border-2 border-white bg-transparent px-12 py-3 my-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={() => setIsRightPanelActive(false)}
          >
            Sign In
          </button>
        </div>

        <div
          className={`absolute right-0 flex flex-col items-center justify-center px-10 text-center h-full w-1/2 transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
            isRightPanelActive ? 'translate-x-[15%]' : 'translate-x-0'
          }`}
        >
          <h1 className="font-bold mb-4 text-3xl">
            {userRole === 'TEACHER' ? 'Hello, Teacher!' : 'Hello, Friend!'}
          </h1>
          <p className="text-sm font-normal leading-5 tracking-wider my-5">
            {userRole === 'TEACHER' 
              ? 'Join our platform to transform your teaching experience with AI-powered tools'
              : 'Enter your personal details and start journey with us'
            }
          </p>
          <button
            className="rounded-3xl border-2 border-white bg-transparent px-12 py-3 my-3 text-white font-bold text-base uppercase tracking-wider transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
            onClick={() => setIsRightPanelActive(true)}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverlayContainer;
