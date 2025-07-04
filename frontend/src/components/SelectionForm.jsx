import React from 'react';

const colorMap = {
  blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
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
}) => {
  const [openDropdown, setOpenDropdown] = React.useState(null);

  const availableSubjects = selectedClass ? classConfig[selectedClass]?.subjects || [] : [];
  const availableChapters = selectedClass && selectedSubject ? classConfig[selectedClass]?.chapters[selectedSubject] || 0 : 0;

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className={`max-w-lg mx-auto bg-gradient-to-br from-white to-gray-50/50 rounded-lg p-6 md:p-8 shadow-sm border border-gray-100`}>
      <div className="space-y-4 mb-8">
        {/* Class Dropdown */}
        <div className="relative">
          <button
            className="w-full max-w-md flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50/30 border border-gray-200 rounded-lg text-gray-700 hover:bg-blue-50/50 transition-colors"
            onClick={() => toggleDropdown('class')}
            aria-expanded={openDropdown === 'class'}
          >
            <span>{selectedClass || 'Select Class'}</span>
            <span className={`transform transition-transform ${openDropdown === 'class' ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {openDropdown === 'class' && (
            <div className="absolute z-10 left-full top-0 ml-2 md:ml-4 lg:ml-6 bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg shadow-lg w-48 max-h-60 overflow-y-auto">
              {Object.keys(classConfig).map((cls) => (
                <button
                  key={cls}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50/30 transition-colors"
                  onClick={() => {
                    setSelectedClass(cls);
                    setSelectedSubject('');
                    setSelectedChapter('');
                    setOpenDropdown(null);
                  }}
                >
                  {cls}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subject Dropdown */}
        <div className="relative">
          <button
            className={`w-full max-w-md flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50/30 border border-gray-200 rounded-lg text-gray-700 hover:bg-blue-50/50 transition-colors ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => selectedClass && toggleDropdown('subject')}
            disabled={!selectedClass}
            aria-expanded={openDropdown === 'subject'}
          >
            <span>{selectedSubject || 'Select Subject'}</span>
            <span className={`transform transition-transform ${openDropdown === 'subject' ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {openDropdown === 'subject' && selectedClass && (
            <div className="absolute z-10 left-full top-0 ml-2 md:ml-4 lg:ml-6 bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg shadow-lg w-48 max-h-60 overflow-y-auto">
              {availableSubjects.map((sub) => (
                <button
                  key={sub}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50/30 transition-colors"
                  onClick={() => {
                    setSelectedSubject(sub);
                    setSelectedChapter('');
                    setOpenDropdown(null);
                  }}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chapter Dropdown */}
        <div className="relative mb-8">
          <button
            className={`w-full max-w-md flex items-center justify-between p-4 bg-gradient-to-r from-white to-gray-50/30 border border-gray-200 rounded-lg text-gray-700 hover:bg-blue-50/50 transition-colors ${!selectedSubject ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => selectedSubject && toggleDropdown('chapter')}
            disabled={!selectedSubject}
            aria-expanded={openDropdown === 'chapter'}
          >
            <span>{selectedChapter || 'Select Chapter'}</span>
            <span className={`transform transition-transform ${openDropdown === 'chapter' ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {openDropdown === 'chapter' && selectedSubject && (
            <div className="absolute z-10 left-full top-0 ml-2 md:ml-4 lg:ml-6 bg-gradient-to-br from-white to-gray-50/50 border border-gray-200 rounded-lg shadow-lg w-48 max-h-60 overflow-y-auto">
              {Array.from({ length: availableChapters }, (_, i) => (
                <button
                  key={i + 1}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50/30 transition-colors"
                  onClick={() => {
                    setSelectedChapter(`Chapter ${i + 1}`);
                    setOpenDropdown(null);
                  }}
                >
                  Chapter {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-600 bg-red-50 p-3 rounded-lg text-center mb-6 max-w-lg mx-auto">
          {error}
        </p>
      )}

      <button
        className={`w-full max-w-md py-3 md:py-4 px-6 rounded-lg text-white font-semibold text-lg transition-colors ${
          !selectedClass || !selectedSubject || !selectedChapter
            ? 'bg-gray-300 cursor-not-allowed'
            : colorMap[themeColor] || colorMap.blue
        }`}
        onClick={onSubmit}
        disabled={!selectedClass || !selectedSubject || !selectedChapter || loading}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default SelectionForm; 