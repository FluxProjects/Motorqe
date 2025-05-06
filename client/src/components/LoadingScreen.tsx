// @/components/LoadingScreen.tsx
import React from "react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-white text-gray-700">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
};
