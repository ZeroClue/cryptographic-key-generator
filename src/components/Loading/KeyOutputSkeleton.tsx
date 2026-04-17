import React from 'react';

interface KeyOutputSkeletonProps {
    title: string;
}

const KeyOutputSkeleton: React.FC<KeyOutputSkeletonProps> = ({ title }) => {
    return (
        <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-200 mb-2">{title}</h2>
            <div className="relative">
                <div className="w-full p-4 bg-brand-dark rounded-md shadow-inner min-h-[12rem] border border-gray-700">
                    <div className="space-y-3">
                        {/* Animated pulse skeleton for multiple lines of text */}
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-3">
                                <div className="h-4 bg-gray-600 rounded animate-pulse flex-1"></div>
                                {i === 0 && (
                                    <div className="h-4 w-16 bg-gray-600 rounded animate-pulse"></div>
                                )}
                            </div>
                        ))}
                    </div>
                    {/* Animated shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/10 to-transparent animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export default KeyOutputSkeleton;