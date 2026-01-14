import { AlertCircle, RefreshCw } from 'lucide-react'

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-8 animate-fadeIn">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Icon */}
            <div className="p-4 bg-red-50 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900">
              Unable to Load Data
            </h3>

            {/* Message */}
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 w-full">
              <p className="text-sm text-red-800 font-medium">{message}</p>
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-2 w-full pt-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <RefreshCw className="h-5 w-5" />
                  <span>Try Again</span>
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Reload Page
              </button>
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-500 pt-2">
              If the problem persists, please check your internet connection or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorMessage
