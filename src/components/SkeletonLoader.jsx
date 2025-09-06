// Skeleton loader for cards
export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        <div className="h-8 bg-gray-200 rounded-full w-16"></div>
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-4"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>

        {/* Progress bar skeleton */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-12"></div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-gray-300 h-2 rounded-full w-3/4"></div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
          </div>
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-16 mx-auto"></div>
          </div>
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-end space-x-2 mt-6">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
};

// Skeleton loader for table rows
export const TableRowSkeleton = () => {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </td>
    </tr>
  );
};

// Skeleton loader for list items
export const ListItemSkeleton = () => {
  return (
    <div className="flex items-center space-x-4 p-4 border-b border-gray-200 animate-pulse">
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20"></div>
    </div>
  );
};

// Skeleton loader for charts
export const ChartSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  );
};

// Skeleton loader for metrics cards
export const MetricCardSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
      <div className="mt-4">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-20 mt-2"></div>
      </div>
    </div>
  );
};

// Skeleton loader for forms
export const FormSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-16 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      <div className="flex justify-end space-x-3">
        <div className="h-10 bg-gray-200 rounded w-20"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

// Skeleton loader for navigation
export const NavigationSkeleton = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CardSkeleton;
