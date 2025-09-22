import React from 'react';
import { ImBooks } from "react-icons/im";

const colorMap = {
  blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  orange: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
  yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600',
};

const SelectionForm = ({
  classConfig,
  selectedClass,
  setSelectedClass,
  selectedSubject,
  setSelectedSubject,
  selectedChapter,
  setSelectedChapter,
  buttonLabel = 'Submit',
  onSubmit,
  loading = false,
  error = '',
  themeColor = 'blue',
  subjectIcons = {},
  isDarkMode = false,
}) => {
  const [openDropdown, setOpenDropdown] = React.useState(null);

  const availableSubjects = selectedClass ? classConfig[selectedClass]?.subjects || [] : [];
  const availableChapters = selectedClass && selectedSubject ? classConfig[selectedClass]?.chapters[selectedSubject] || 0 : 0;

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const getThemeColors = () => {
    if (isDarkMode) {
      switch (themeColor) {
        case 'blue': return {
          hover: 'hover:bg-blue-900/30',
          selected: 'bg-blue-900/20',
          border: 'border-blue-600',
          text: 'text-blue-300'
        };
        case 'purple': return {
          hover: 'hover:bg-purple-900/30',
          selected: 'bg-purple-900/20',
          border: 'border-purple-600',
          text: 'text-purple-300'
        };
        case 'orange': return {
          hover: 'hover:bg-orange-900/30',
          selected: 'bg-orange-900/20',
          border: 'border-orange-600',
          text: 'text-orange-300'
        };
        case 'green': return {
          hover: 'hover:bg-green-900/30',
          selected: 'bg-green-900/20',
          border: 'border-green-600',
          text: 'text-green-300'
        };
        case 'yellow': return {
          hover: 'hover:bg-yellow-900/30',
          selected: 'bg-yellow-900/20',
          border: 'border-yellow-600',
          text: 'text-yellow-300'
        };
        default: return {
          hover: 'hover:bg-blue-900/30',
          selected: 'bg-blue-900/20',
          border: 'border-blue-600',
          text: 'text-blue-300'
        };
      }
    } else {
      switch (themeColor) {
        case 'blue': return {
          hover: 'hover:bg-blue-50/50',
          selected: 'bg-blue-50/30',
          border: 'border-blue-200',
          text: 'text-blue-700'
        };
        case 'purple': return {
          hover: 'hover:bg-purple-50/50',
          selected: 'bg-purple-50/30',
          border: 'border-purple-200',
          text: 'text-purple-700'
        };
        case 'orange': return {
          hover: 'hover:bg-orange-50/50',
          selected: 'bg-orange-50/30',
          border: 'border-orange-200',
          text: 'text-orange-700'
        };
        case 'green': return {
          hover: 'hover:bg-green-50/50',
          selected: 'bg-green-50/30',
          border: 'border-green-200',
          text: 'text-green-700'
        };
        case 'yellow': return {
          hover: 'hover:bg-yellow-50/50',
          selected: 'bg-yellow-50/30',
          border: 'border-yellow-200',
          text: 'text-yellow-600'
        };
        default: return {
          hover: 'hover:bg-blue-50/50',
          selected: 'bg-blue-50/30',
          border: 'border-blue-200',
          text: 'text-blue-700'
        };
      }
    }
  };

  const colors = getThemeColors();

  const getBadgeColors = (themeColor) => {
    if (isDarkMode) {
      switch (themeColor) {
        case 'blue': return 'bg-blue-900/50 text-blue-300';
        case 'purple': return 'bg-purple-900/50 text-purple-300';
        case 'orange': return 'bg-orange-900/50 text-orange-300';
        case 'green': return 'bg-green-900/50 text-green-300';
        case 'yellow': return 'bg-yellow-900/50 text-yellow-300';
        default: return 'bg-blue-900/50 text-blue-300';
      }
    } else {
      switch (themeColor) {
        case 'blue': return 'bg-blue-100 text-blue-700';
        case 'purple': return 'bg-purple-100 text-purple-700';
        case 'orange': return 'bg-orange-100 text-orange-700';
        case 'green': return 'bg-green-100 text-green-700';
        case 'yellow': return 'bg-yellow-100 text-yellow-700';
        default: return 'bg-blue-100 text-blue-700';
      }
    }
  };

  const badgeColors = getBadgeColors(themeColor);

  return (
    <div className={`max-w-lg mx-auto rounded-2xl p-8 md:p-10 shadow-2xl backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-gray-800 border border-gray-700' 
        : 'bg-white border border-gray-200/50'
    }`}>
      <div className="space-y-6 mb-8">
        {/* Class Dropdown */}
        <div className="relative">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Select Class
          </label>
          <button
            className={`w-full flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-700'
            } ${colors.hover} ${
              selectedClass ? colors.border + ' ' + colors.text : ''
            }`}
            onClick={() => toggleDropdown('class')}
            aria-expanded={openDropdown === 'class'}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
              }`}>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {selectedClass ? selectedClass.split(' ')[1] : '?'}
                </span>
              </div>
              <span className="font-medium">{selectedClass || 'Choose your class'}</span>
            </div>
            <span className={`transform transition-transform duration-200 ${openDropdown === 'class' ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {openDropdown === 'class' && (
            <div className={`absolute z-[100] right-0 top-full mt-2 mb-12 border rounded-xl shadow-2xl max-h-60 overflow-y-auto min-w-[280px] ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              {Object.keys(classConfig).map((cls) => (
                <button
                  key={cls}
                  className={`w-full px-4 py-3 text-left ${colors.hover} transition-colors flex items-center gap-3 ${
                    selectedClass === cls ? colors.selected : ''
                  }`}
                  onClick={() => {
                    setSelectedClass(cls);
                    setSelectedSubject('');
                    setSelectedChapter('');
                    setOpenDropdown(null);
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{cls.split(' ')[1]}</span>
                  </div>
                  <span className="font-medium">{cls}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subject Dropdown */}
        <div className="relative">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Select Subject
          </label>
          <button
            className={`w-full flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-700'
            } ${
              !selectedClass ? 'opacity-50 cursor-not-allowed' : colors.hover
            } ${
              selectedSubject ? colors.border + ' ' + colors.text : ''
            }`}
            onClick={() => selectedClass && toggleDropdown('subject')}
            disabled={!selectedClass}
            aria-expanded={openDropdown === 'subject'}
          >
            <div className="flex items-center gap-3">
              {selectedSubject && subjectIcons[selectedSubject] ? (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                }`}>
                  {React.createElement(subjectIcons[selectedSubject], { 
                    className: `w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}` 
                  })}
                </div>
              ) : (
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                }`}>
                  <ImBooks className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                </div>
              )}
              <span className="font-medium">{selectedSubject || 'Choose your subject'}</span>
            </div>
            <span className={`transform transition-transform duration-200 ${openDropdown === 'subject' ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {openDropdown === 'subject' && selectedClass && (
            <div className={`absolute z-[100] right-0 top-full mt-2 mb-12 border rounded-xl shadow-2xl max-h-60 overflow-y-auto min-w-[280px] ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}>
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  className={`w-full px-4 py-3 text-left ${colors.hover} transition-colors flex items-center gap-3 ${
                    selectedSubject === sub ? colors.selected : ''
                  }`}
                  onClick={() => {
                    setSelectedSubject(sub);
                    setSelectedChapter('');
                    setOpenDropdown(null);
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    {subjectIcons[sub] ? 
                      React.createElement(subjectIcons[sub], { 
                        className: `w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}` 
                      }) :
                      <ImBooks className={`w-4 h-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} />
                    }
                  </div>
                  <span className="font-medium">{sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chapter Dropdown */}
        <div className="relative">
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            Select Chapter
          </label>
          <button
            className={`w-full flex items-center justify-between p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-700'
            } ${
              !selectedSubject ? 'opacity-50 cursor-not-allowed' : colors.hover
            } ${
              selectedChapter ? colors.border + ' ' + colors.text : ''
            }`}
            onClick={() => selectedSubject && toggleDropdown('chapter')}
            disabled={!selectedSubject}
            aria-expanded={openDropdown === 'chapter'}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
              }`}>
                <span className={`text-sm font-semibold ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {selectedChapter || '#'}
                </span>
              </div>
              <span className="font-medium">
                {selectedChapter ? `Chapter ${selectedChapter}` : 'Choose your chapter'}
              </span>
            </div>
            <span className={`transform transition-transform duration-200 ${openDropdown === 'chapter' ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          {openDropdown === 'chapter' && selectedSubject && (
            <div className={`absolute z-[100] right-0 top-full mt-2 mb-12 border rounded-xl shadow-2xl max-h-60 overflow-y-auto min-w-[280px] ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}> 
              {Array.from({ length: availableChapters }, (_, i) => i + 1).map((chapter) => (
                <button
                  key={chapter}
                  className={`w-full px-4 py-3 text-left ${colors.hover} transition-colors flex items-center gap-3 ${
                    selectedChapter === chapter.toString() ? colors.selected : ''
                  }`}
                  onClick={() => {
                    setSelectedChapter(chapter.toString());
                    setOpenDropdown(null);
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-600' : 'bg-gray-100'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>{chapter}</span>
                  </div>
                  <span className="font-medium">Chapter {chapter}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        className={`w-full ${colorMap[themeColor]} text-white font-bold py-5 px-8 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg tracking-wide`}
        onClick={onSubmit}
        disabled={loading || !selectedClass || !selectedSubject || !selectedChapter}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-3">
            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold">Loading...</span>
          </div>
        ) : (
          buttonLabel
        )}
      </button>

      {/* Selection Summary */}
      {selectedClass && selectedSubject && selectedChapter && (
        <div className={`mt-6 p-4 rounded-lg border ${
          isDarkMode 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`flex items-center gap-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <span className={`px-2 py-1 rounded-md font-medium ${badgeColors}`}>{selectedClass}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-md font-medium ${badgeColors}`}>{selectedSubject}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-md font-medium ${badgeColors}`}>Chapter {selectedChapter}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionForm; 