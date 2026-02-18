import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext, TeamMember } from '../context/AppContext';
import { ChevronLeft, Pencil } from 'lucide-react';

// Mock names for random assignment
const mockNames = ['John', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'Alex', 'Maria'];

// Extract branch code from USN
const extractBranchCode = (usn: string): string => {
  if (!usn || usn.length < 8) return '';
  return usn.substring(6, 8).toUpperCase();
};

// Map branch codes to streams
const mapBranchToStream = (branchCode: string): string => {
  const streamMap: { [key: string]: string } = {
    'CS': 'Computer Science',
    'CI': 'Computer Science', // AIML
    'CB': 'Computer Science', // CS & Business
    'EC': 'Electronics',
    'EE': 'Electronics',
    'VL': 'Electronics', // VLSI
    'ME': 'Mechanical',
    'RO': 'Mechanical', // Robotics
    'CV': 'Civil',
  };
  
  return streamMap[branchCode] || 'Unknown';
};

// Extract section from USN (last 3 digits -> section letter)
const extractSection = (usn: string): string => {
  if (!usn || usn.length < 11) return '';
  const rollNumber = parseInt(usn.substring(8, 11));
  
  if (rollNumber <= 90) return 'A';
  if (rollNumber <= 180) return 'B';
  if (rollNumber <= 270) return 'C';
  return 'O';
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

export default function TeamSelection() {
  const navigate = useNavigate();
  const { teamLeader, teamMembers, setTeamMembers } = useAppContext();
  
  const [verifiedMembers, setVerifiedMembers] = useState<TeamMember[]>(teamMembers);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempUsn, setTempUsn] = useState('');
  const [tempDob, setTempDob] = useState('');

  const handleVerify = async () => {
    if (!tempUsn || !tempDob) {
      alert('Please enter both USN and DOB.');
      return;
    }

    if (!validateUSN(tempUsn)) {
      alert('Invalid USN format! Must be: 4MC{year}{branch}{roll}\nExample: 4MC23CS003');
      return;
    }

    if (!validateDOB(tempDob)) {
      alert('Invalid DOB format! Must be: DDMMYY\nExample: 150203 for 15th Feb 2003');
      return;
    }

    const branchCode = extractBranchCode(tempUsn);
    const stream = mapBranchToStream(branchCode);
    const section = extractSection(tempUsn);

    const mockMember: TeamMember = {
      usn: tempUsn,
      dob: tempDob,
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      stream: stream,
      section: section,
    };

    if (editingIndex !== null && editingIndex < verifiedMembers.length) {
      // Update existing member
      const updated = [...verifiedMembers];
      updated[editingIndex] = mockMember;
      setVerifiedMembers(updated);
    } else {
      // Add new member
      setVerifiedMembers([...verifiedMembers, mockMember]);
    }
    
    setEditingIndex(null);
    setTempUsn('');
    setTempDob('');
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempUsn(verifiedMembers[index].usn);
    setTempDob(verifiedMembers[index].dob);
  };

  const handleDelete = (index: number) => {
    const updated = verifiedMembers.filter((_, i) => i !== index);
    setVerifiedMembers(updated);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setTempUsn('');
    setTempDob('');
  };

  const handleSaveEdit = () => {
    handleVerify();
  };

  const handleContinue = () => {
    if (verifiedMembers.length !== 5) {
      alert('You must add exactly 5 team members (not including team leader).\nTotal team size: 6 members (1 leader + 5 members)');
      return;
    }

    const validMembers = verifiedMembers.filter(m => m.usn && m.dob);
    
    // Check for at least 2 different streams including team leader
    const allTeamMembers = teamLeader ? [teamLeader, ...validMembers] : validMembers;
    const streams = new Set(allTeamMembers.map(m => m.stream).filter(s => s && s !== 'Unknown'));
    
    if (streams.size < 2) {
      alert('Team must have members from at least 2 different streams!\nStreams: Computer Science, Electronics, Mechanical, Civil');
      return;
    }
    
    setTeamMembers(validMembers);
    navigate('/guide');
  };

  return (
    <div className="bg-[#e9e9e9] relative w-full min-h-screen">
      <div className="relative w-full max-w-[398px] mx-auto px-4 sm:px-6 md:px-8 pb-[40px]">
        {/* Header */}
        <div className="flex items-center pt-[16px]">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="w-[30px] h-[42px] cursor-pointer flex items-center justify-center mr-2"
          >
            <ChevronLeft size={30} className="text-[#3b3b3b]" strokeWidth={2.5} />
          </button>
          
          <p className="font-['Cormorant',serif] font-bold leading-[64px] text-[#3b3b3b] text-[57px]">
            IP
          </p>
        </div>

        {/* Title */}
        <p className="font-['Cormorant',serif] font-normal leading-[44px] sm:leading-[52px] text-[#171717] text-[32px] sm:text-[40px] mt-[10px]">
          Team Leader
        </p>

        {/* Team Leader Info Card */}
        {teamLeader && (
          <div className="mt-[20px] sm:mt-[30px] relative w-full border border-[#3b3b3b] rounded-[15px] p-[16px]">
            <div className="grid grid-cols-2 gap-x-4 gap-y-[12px]">
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                  Name
                </p>
                <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                  {teamLeader.name || 'Max'}
                </p>
              </div>
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                  USN
                </p>
                <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                  {teamLeader.usn}
                </p>
              </div>
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                  Stream
                </p>
                <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                  {teamLeader.stream || 'Computer Science'}
                </p>
              </div>
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                  Section
                </p>
                <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                  {teamLeader.section || 'O'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Team Members Section */}
        <p className="font-['Cormorant',serif] font-normal leading-[44px] sm:leading-[52px] text-[#171717] text-[32px] sm:text-[40px] mt-[40px] sm:mt-[60px]">
          Add Team Members
        </p>

        <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999] mt-[12px]">
          {verifiedMembers.length}/5 Members Added
        </p>

        {/* Input Form */}
        <div className="mt-[20px] sm:mt-[30px]">
          <div className="space-y-[12px] mb-[12px]">
            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717] mb-[8px]">
                University Seat Number
              </label>
              <input
                type="text"
                value={tempUsn}
                onChange={(e) => setTempUsn(e.target.value.toUpperCase())}
                className="w-full h-[40px] border border-black rounded-[15px] px-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="4MCXXYYZZZ"
                disabled={verifiedMembers.length >= 5 && editingIndex === null}
              />
            </div>
            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717] mb-[8px]">
                Date of Birth (DDMMYY)
              </label>
              <input
                type="password"
                value={tempDob}
                onChange={(e) => setTempDob(e.target.value)}
                placeholder="DDMMYY"
                maxLength={6}
                className="w-full h-[40px] border border-black rounded-[15px] px-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
                disabled={verifiedMembers.length >= 5 && editingIndex === null}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {editingIndex !== null && (
              <button
                onClick={handleCancelEdit}
                className="px-4 h-[30px] border border-black rounded-[10px] font-['Inter',sans-serif] font-semibold text-[#171717] text-[12px] hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleVerify}
              disabled={verifiedMembers.length >= 5 && editingIndex === null}
              className="px-4 h-[30px] bg-black rounded-[10px] font-['Inter',sans-serif] font-semibold text-[#e9e9e9] text-[12px] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editingIndex !== null ? 'Save' : 'Verify'}
            </button>
          </div>
        </div>

        {/* Verified Members List */}
        {verifiedMembers.length > 0 && (
          <div className="mt-[24px] sm:mt-[35px] space-y-[16px]">
            <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999]">
              Team Members
            </p>
            {verifiedMembers.map((member, index) => (
              <div
                key={index}
                className="relative w-full border border-[#3b3b3b] rounded-[15px] p-[16px] pr-[50px]"
              >
                <div className="grid grid-cols-2 gap-x-4 gap-y-[12px]">
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      Name
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                      {member.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      USN
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                      {member.usn}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      Stream
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                      {member.stream || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      Section
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                      {member.section || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="absolute top-[16px] right-[16px] flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="w-[25px] h-[25px] bg-black rounded-[6px] flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <Pencil size={14} className="text-[#e9e9e9]" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="w-[25px] h-[25px] border border-black rounded-[6px] flex items-center justify-center font-['Inter',sans-serif] font-bold text-[#171717] text-[14px] hover:bg-gray-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-[24px] sm:mt-[35px]">
          <button
            onClick={handleContinue}
            className="w-[111px] h-[30px] bg-black rounded-[10px] flex items-center justify-center font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[24px] leading-[44px] hover:bg-gray-800 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}