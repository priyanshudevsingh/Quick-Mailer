const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-96 mx-auto"></div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-lg"></div>
              <div className="ml-3 lg:ml-4 flex-1">
                <div className="h-3 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-8"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-3 lg:mb-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-200 rounded-lg"></div>
                  {index < 2 && (
                    <div className="ml-3">
                      <div className="h-5 bg-gray-200 rounded w-16"></div>
                    </div>
                  )}
                </div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3 lg:mb-4"></div>
                <div className="flex items-center">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="w-3 h-3 lg:w-4 lg:h-4 ml-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;