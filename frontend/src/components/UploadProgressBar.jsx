const UploadProgressBar = ({ progress, status }) => {
  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading to cloud...';
      case 'processing':
        return 'Processing video...';
      case 'complete':
        return 'Upload complete!';
      case 'error':
        return 'Upload failed';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'error':
        return 'from-red-500 to-red-600';
      case 'complete':
        return 'from-green-500 to-green-600';
      default:
        return 'from-red-500 to-red-400';
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span className="flex items-center gap-2">
          {status === 'complete' ? (
            <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : status === 'error' ? (
            <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-4 h-4 animate-spin text-red-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {getStatusText()}
        </span>
        <span className="text-white font-medium">{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${getStatusColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgressBar;
