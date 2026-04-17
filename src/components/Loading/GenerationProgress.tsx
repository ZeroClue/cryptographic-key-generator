import React from 'react';

interface GenerationProgressProps {
    message?: string;
    percentage?: number;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ message = "Generating key...", percentage }) => {
    return (
        <div className="w-full p-6 flex flex-col items-center justify-center bg-brand-dark rounded-md shadow-inner border border-gray-700">
            {/* Spinner icon */}
            <div className="animate-spin mb-4">
                <svg className="w-10 h-10 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>

            {/* Progress message */}
            <p className="text-gray-300 mb-4 text-center">{message}</p>

            {/* Progress bar with percentage */}
            <div className="w-full max-w-md">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Progress</span>
                    {percentage !== undefined && <span>{percentage}%</span>}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="h-2 rounded-full transition-all duration-300 bg-brand-primary"
                        style={{ width: percentage !== undefined ? `${percentage}%` : '60%' }}
                        role="progressbar"
                        aria-valuenow={percentage || 60}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    ></div>
                </div>
            </div>

            {/* Additional details for PGP generation */}
            {message.includes('PGP') && (
                <div className="mt-4 text-xs text-gray-500 space-y-1">
                    <p>• Generating cryptographic material</p>
                    <p>• Creating user identity</p>
                    <p>• Establishing trust level</p>
                </div>
            )}
        </div>
    );
};

export default GenerationProgress;