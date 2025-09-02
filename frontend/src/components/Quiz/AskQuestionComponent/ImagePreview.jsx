import React from 'react';

const ImagePreview = ({ imagePreview, showImageModal, setShowImageModal }) => {
    if (!showImageModal || !imagePreview) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
        >
            <div className="relative max-w-4xl max-h-full">
                <button
                    onClick={() => setShowImageModal(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10"
                    aria-label="Close image"
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img
                    src={imagePreview}
                    alt="Question Preview Full Size"
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export default ImagePreview;
