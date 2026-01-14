const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 animate-fadeIn">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-primary/20 rounded-full absolute`} />
        {/* Spinning ring */}
        <div className={`${sizeClasses[size]} border-4 border-primary border-t-transparent rounded-full animate-spin`} />
        {/* Inner pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      {text && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold text-gray-900 animate-pulse">{text}</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner
