import { FallbackProps } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <h2 className="text-2xl text-red-600 mb-2">Oops! Something went wrong.</h2>
      <pre className="text-sm text-gray-700 mb-4">{error.message}</pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorFallback;
