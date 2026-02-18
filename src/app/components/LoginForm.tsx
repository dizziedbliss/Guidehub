import { useState } from 'react';
import { useNavigate } from 'react-router';

// Validate USN format: 4MC{xx}{xx}{xxx}
const validateUSN = (usn: string): boolean => {
  const usnRegex = /^4MC\d{2}[A-Z]{2}\d{3}$/;
  return usnRegex.test(usn);
};

// Validate DOB format: DDMMYY
const validateDOB = (dob: string): boolean => {
  const dobRegex = /^\d{6}$/;
  if (!dobRegex.test(dob)) return false;
  
  const day = parseInt(dob.substring(0, 2));
  const month = parseInt(dob.substring(2, 4));
  
  return day >= 1 && day <= 31 && month >= 1 && month <= 12;
};

export default function LoginForm() {
  const [seatNumber, setSeatNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate USN format
    if (!validateUSN(seatNumber)) {
      alert('Invalid USN format! Must be: 4MC{year}{branch}{roll}\nExample: 4MC23CS003');
      return;
    }
    
    // Validate DOB format
    if (!validateDOB(password)) {
      alert('Invalid DOB format! Must be: DDMMYY\nExample: 150203 for 15th Feb 2003');
      return;
    }
    
    console.log('Login attempted with:', { seatNumber, password });
    // Navigate to team selection page after login
    navigate('/team');
  };

  return (
    <div className="bg-[#e9e9e9] relative w-full h-full min-h-screen flex items-center justify-center px-4 sm:px-6">
      <div className="relative w-full max-w-[398px]">
        {/* Title */}
        <div className="font-['Cormorant',serif] font-bold leading-[56px] sm:leading-[64px] text-[#3b3b3b] text-[48px] sm:text-[57px]">
          <p className="mb-0">Interdisciplinary</p>
          <p>Project</p>
        </div>

        {/* Subtitle */}
        <p className="mt-4 font-['Cabin',sans-serif] font-normal leading-[36px] sm:leading-[44px] text-[#171717] text-[20px] sm:text-[24px]">
          Team and Guide Selection
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-[80px] sm:mt-[120px]">
          {/* University Seat Number Field */}
          <div className="w-full mb-[80px] sm:mb-[93px]">
            <label className="block font-['Inter',sans-serif] font-semibold text-[#171717] text-[12px] mb-[12px]">
              University Seat Number
            </label>
            <input
              type="text"
              value={seatNumber}
              onChange={(e) => setSeatNumber(e.target.value.toUpperCase())}
              className="w-full h-[40px] border border-black rounded-[15px] px-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
              required
              placeholder="4MCXXYYZZZ"
            />
          </div>

          {/* Password Field */}
          <div className="w-full mb-[80px] sm:mb-[103px]">
            <div className="flex flex-wrap items-center gap-2 mb-[12px]">
              <label className="font-['Inter',sans-serif] font-semibold text-[#171717] text-[12px]">
                Password
              </label>
              <span className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999]">
                Date of Birth in DDMMYY Format
              </span>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="DDMMYY"
              maxLength={6}
              className="w-full h-[40px] border border-black rounded-[15px] px-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Login Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="w-[111px] h-[30px] bg-black rounded-[10px] flex items-center justify-center font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[24px] leading-[44px] hover:bg-gray-800 transition-colors"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}