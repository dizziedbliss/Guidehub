import { useRouteError, useNavigate } from 'react-router';

export default function ErrorBoundary() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <div className="bg-[#e9e9e9] relative w-full h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="relative w-full max-w-[398px] text-center">
        <p className="font-['Cormorant',serif] font-bold leading-[64px] text-[#3b3b3b] text-[57px] mb-4">
          Oops!
        </p>
        <p className="font-['Cabin',sans-serif] font-normal leading-[36px] text-[#171717] text-[20px] mb-8">
          Something went wrong
        </p>
        
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 rounded-[10px]">
            <p className="font-['Inter',sans-serif] text-[12px] text-red-700 leading-[16px]">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        )}

        <button
          onClick={() => navigate('/')}
          className="w-[150px] h-[40px] bg-black rounded-[10px] font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[20px] hover:bg-gray-800 transition-colors mx-auto"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
