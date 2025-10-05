/**
 * RouteLoader Component
 *
 * Purpose: Skeleton loading state for route transitions
 * Used by: React.lazy route components
 *
 * Features:
 * - Animated skeleton placeholder
 * - Matches typical page layout
 * - Smooth transition
 * - Reduced layout shift
 */

export function RouteLoader() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header skeleton */}
      <div className="h-16 bg-white shadow">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
            <div className="h-8 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto p-4 max-w-7xl">
        {/* Main content area */}
        <div className="h-64 bg-white rounded-lg shadow mb-4"></div>

        {/* Grid of cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-32 bg-white rounded-lg shadow"></div>
          <div className="h-32 bg-white rounded-lg shadow"></div>
          <div className="h-32 bg-white rounded-lg shadow"></div>
          <div className="h-32 bg-white rounded-lg shadow"></div>
          <div className="h-32 bg-white rounded-lg shadow"></div>
          <div className="h-32 bg-white rounded-lg shadow"></div>
        </div>
      </div>
    </div>
  );
}

export default RouteLoader;
