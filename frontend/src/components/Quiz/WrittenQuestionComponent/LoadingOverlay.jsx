import React from 'react';
import TeacherLoadingScreen from '../../Common/TeacherLoadingScreen';

const LoadingOverlay = ({ isSubmitting }) => {
    if (!isSubmitting) return null;

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50/95 via-white/95 to-green-50/95 backdrop-blur-lg flex flex-col items-center justify-center z-50">
            <TeacherLoadingScreen 
                message="Teacher is carefully reviewing your handwritten answer..."
                size="xlarge"
            />
        </div>
    );
};

export default LoadingOverlay;
