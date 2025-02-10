import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
  type?: 'record' | 'stats';
}

export function LoadingSkeleton({ count = 3, type = 'record' }: LoadingSkeletonProps) {
  if (type === 'stats') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center p-4 rounded-lg bg-gray-100">
          <div className="mr-4">
            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          </div>
          <div className="space-y-3 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}