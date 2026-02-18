import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';

// Mock student database - In production, this would be fetched from Supabase
// inTeam flag would be managed by database, not client-side
const mockStudentDatabase: { [key: string]: { name: string; dob: string; section: string; inTeam: boolean } } = {
  '4MC23CS001': { name: 'Aarav Sharma', dob: '120305', section: 'A', inTeam: false },
  '4MC23CI002': { name: 'Vivaan Reddy', dob: '210705', section: 'B', inTeam: false },
  '4MC22EE003': { name: 'Ishaan Nair', dob: '051104', section: 'C', inTeam: false },
  '4MC23EC004': { name: 'Aditya Rao', dob: '180105', section: 'D', inTeam: false },
  '4MC24CB005': { name: 'Reyansh Gupta', dob: '300906', section: 'E', inTeam: false },
  '4MC22ME006': { name: 'Arjun Patil', dob: '250404', section: 'F', inTeam: false },
  '4MC23CI007': { name: 'Karthik Iyer', dob: '141205', section: 'G', inTeam: false },
  '4MC24CS008': { name: 'Siddharth Jain', dob: '070806', section: 'H', inTeam: false },
  '4MC22CV009': { name: 'Harsh Vardhan', dob: '190204', section: 'I', inTeam: false },
  '4MC23RB010': { name: 'Nikhil Das', dob: '090605', section: 'J', inTeam: false },
  '4MC23CI011': { name: 'Ananya Shetty', dob: '150505', section: 'K', inTeam: false },
  '4MC24CS012': { name: 'Diya Menon', dob: '221006', section: 'L', inTeam: false },
  '4MC23EC013': { name: 'Sneha Kulkarni', dob: '010105', section: 'M', inTeam: false },
  '4MC22EE014': { name: 'Kavya Nambiar', dob: '170304', section: 'N', inTeam: false },
  '4MC24CB015': { name: 'Riya Verma', dob: '290706', section: 'O', inTeam: false },
  '4MC23ME016': { name: 'Meera Joshi', dob: '111105', section: 'P', inTeam: false },
  '4MC23CI017': { name: 'Aditi Rao', dob: '060205', section: 'Q', inTeam: false },
  '4MC24RB018': { name: 'Pooja S', dob: '230806', section: 'R', inTeam: false },
  '4MC22CV019': { name: 'Neha Reddy', dob: '130904', section: 'S', inTeam: false },
  '4MC23VL020': { name: 'Shruti Bhat', dob: '040405', section: 'T', inTeam: false },
  '4MC23CS021': { name: 'Rahul Mishra', dob: '160605', section: 'A', inTeam: false },
  '4MC24CI022': { name: 'Manish Kumar', dob: '271206', section: 'B', inTeam: false },
  '4MC22EE023': { name: 'Tanmay Kulkarni', dob: '031004', section: 'C', inTeam: false },
  '4MC23EC024': { name: 'Pranav Gowda', dob: '080105', section: 'D', inTeam: false },
  '4MC24ME025': { name: 'Yash Patidar', dob: '120206', section: 'E', inTeam: false },
  '4MC23RB026': { name: 'Rohit Das', dob: '190505', section: 'F', inTeam: false },
  '4MC22CS027': { name: 'Saurabh Jain', dob: '280704', section: 'G', inTeam: false },
  '4MC23CI028': { name: 'Omkar Hegde', dob: '090905', section: 'H', inTeam: false },
  '4MC24CB029': { name: 'Varun Iyer', dob: '140406', section: 'I', inTeam: false },
  '4MC23VL030': { name: 'Akash Naik', dob: '210305', section: 'J', inTeam: false },
  '4MC23CS031': { name: 'Priya Rao', dob: '050605', section: 'K', inTeam: false },
  '4MC24CI032': { name: 'Nandini Sharma', dob: '170806', section: 'L', inTeam: false },
  '4MC22EE033': { name: 'Aishwarya Patil', dob: '290104', section: 'M', inTeam: false },
  '4MC23EC034': { name: 'Swathi Hegde', dob: '101005', section: 'N', inTeam: false },
  '4MC24CV035': { name: 'Rachana N', dob: '021206', section: 'O', inTeam: false },
  '4MC23ME036': { name: 'Shreya Kulkarni', dob: '200705', section: 'P', inTeam: false },
  '4MC22RB037': { name: 'Tejas Rao', dob: '260504', section: 'Q', inTeam: false },
  '4MC23CS038': { name: 'Darshan Bhat', dob: '140205', section: 'R', inTeam: false },
  '4MC24CI039': { name: 'Vivek Iyer', dob: '091106', section: 'S', inTeam: false },
  '4MC23CB040': { name: 'Anirudh Menon', dob: '180305', section: 'T', inTeam: false },
};

// Extract branch code from USN (positions 6-7, 0-indexed)
const extractBranchCode = (usn: string): string => {
  if (!usn || usn.length < 9) return '';
  return usn.substring(6, 8).toUpperCase();
};

// Map branch codes to streams
const mapBranchToStream = (branchCode: string): string => {
  const streamMap: { [key: string]: string } = {
    // Computer Science Engineering Stream
    'CB': 'Computer Science Engineering',
    'CS': 'Computer Science Engineering',
    'CI': 'Computer Science Engineering',
    
    // Electronics Engineering Stream
    'EE': 'Electronics Engineering',
    'EC': 'Electronics Engineering',
    'VL': 'Electronics Engineering',
    
    // Mechanical Engineering Stream
    'ME': 'Mechanical Engineering',
    'RB': 'Mechanical Engineering',
    
    // Civil Engineering Stream
    'CV': 'Civil Engineering',
  };
  
  return streamMap[branchCode] || 'Unknown';
};

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
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { setTeamLeader } = useAppContext();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const trimmedUSN = seatNumber.trim().toUpperCase();
    
    // Validate USN format
    if (!validateUSN(trimmedUSN)) {
      setErrorMessage('Invalid USN format! Must be: 4MC{year}{branch}{roll} (e.g., 4MC23CS003)');
      return;
    }
    
    // Validate DOB format
    if (!validateDOB(password)) {
      setErrorMessage('Invalid DOB format! Must be: DDMMYY (e.g., 150203 for 15th Feb 2003)');
      return;
    }
    
    // Check if student exists in database
    const studentData = mockStudentDatabase[trimmedUSN];
    
    if (!studentData) {
      setErrorMessage('Student not found! Please check the USN.');
      return;
    }
    
    // Verify DOB
    if (studentData.dob !== password) {
      setErrorMessage('Date of Birth does not match our records!');
      return;
    }
    
    // Check if student is already in a team (would be checked in database in production)
    if (studentData.inTeam) {
      setErrorMessage('You are already part of a team!');
      return;
    }
    
    // Extract branch code and map to stream
    const branchCode = extractBranchCode(trimmedUSN);
    const stream = mapBranchToStream(branchCode);
    
    console.log('Login Debug:', { trimmedUSN, branchCode, stream });
    
    // Set team leader with actual student data
    setTeamLeader({
      usn: trimmedUSN,
      dob: password,
      name: studentData.name,
      stream: stream,
      section: studentData.section,
    });
    
    // NOTE: inTeam flag will NOT be set here
    // It will only be set when final submission happens (in Confirmation page)
    // This allows users to navigate back without locking their account
    
    console.log('Login successful:', { usn: trimmedUSN, name: studentData.name, stream });
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
              onChange={(e) => {
                setSeatNumber(e.target.value.toUpperCase());
                setErrorMessage('');
              }}
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
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              placeholder="DDMMYY"
              maxLength={6}
              className="w-full h-[40px] border border-black rounded-[15px] px-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-[20px] p-[12px] bg-red-100 border border-red-400 rounded-[10px]">
              <p className="font-['Inter',sans-serif] text-[12px] text-red-700 leading-[16px]">
                {errorMessage}
              </p>
            </div>
          )}

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

// Export database and utility functions for use in other components
export { mockStudentDatabase, extractBranchCode, mapBranchToStream };