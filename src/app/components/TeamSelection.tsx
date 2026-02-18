import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext, TeamMember } from '../context/AppContext';
import { ChevronLeft, Pencil } from 'lucide-react';
import { mockStudentDatabase, getStreamFromUsn } from './LoginForm';

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
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async () => {
    setErrorMessage('');
    
    const trimmedUSN = tempUsn.trim().toUpperCase();
    
    if (!trimmedUSN || !tempDob) {
      setErrorMessage('Please enter both USN and DOB.');
      return;
    }

    if (!validateUSN(trimmedUSN)) {
      setErrorMessage('Invalid USN format! Must be: 4MC{year}{branch}{roll} (e.g., 4MC23CS003)');
      return;
    }

    if (!validateDOB(tempDob)) {
      setErrorMessage('Invalid DOB format! Must be: DDMMYY (e.g., 150203 for 15th Feb 2003)');
      return;
    }

    // Check if student exists in mock database (in production, this would be Supabase)
    const studentData = mockStudentDatabase[trimmedUSN];

    // Student MUST exist in database
    if (!studentData) {
      setErrorMessage('USN not found in database! Please contact administration if this is an error.');
      return;
    }
    
    // Verify DOB
    if (studentData.dob !== tempDob) {
      setErrorMessage('Date of Birth does not match our records!');
      return;
    }

    // Check if student is already in a team (database flag check)
    // This check would be done via Supabase query in production
    if (studentData.inTeam && editingIndex === null) {
      setErrorMessage('This student is already part of a team!');
      return;
    }
    
    // Check if team leader is trying to add themselves
    if (teamLeader && trimmedUSN === teamLeader.usn) {
      setErrorMessage('Team leader cannot be added as a team member!');
      return;
    }
    
    // Check for duplicate in current team (excluding the one being edited)
    const isDuplicate = verifiedMembers.some((member, idx) => 
      member.usn === trimmedUSN && idx !== editingIndex
    );
    
    if (isDuplicate) {
      setErrorMessage('This student is already added to your team!');
      return;
    }

    const stream = getStreamFromUsn(trimmedUSN);
    if (!stream) {
      setErrorMessage('Unsupported branch code in USN. Allowed: CS, CB, CI, EE, EC, VL, RB, ME, CV');
      return;
    }

    const verifiedMember: TeamMember = {
      usn: trimmedUSN,
      dob: tempDob,
      name: studentData?.name ?? 'Team Member',
      stream: stream,
      section: studentData?.section ?? '',
    };

    if (editingIndex !== null && editingIndex < verifiedMembers.length) {
      // Update existing member
      const updated = [...verifiedMembers];
      updated[editingIndex] = verifiedMember;
      setVerifiedMembers(updated);
    } else {
      // Add new member (but don't set inTeam flag yet)
      // Flag will only be set on final submission
      setVerifiedMembers([...verifiedMembers, verifiedMember]);
    }
    
    setEditingIndex(null);
    setTempUsn('');
    setTempDob('');
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setTempUsn(verifiedMembers[index].usn);
    setTempDob(verifiedMembers[index].dob);
    setErrorMessage('');
  };

  const handleDelete = (index: number) => {
    const updated = verifiedMembers.filter((_, i) => i !== index);
    setVerifiedMembers(updated);
    setErrorMessage('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setTempUsn('');
    setTempDob('');
    setErrorMessage('');
  };

  const handleContinue = () => {
    setErrorMessage('');
    
    if (verifiedMembers.length !== 5) {
      setErrorMessage('You must add exactly 5 team members (not including team leader). Total team size: 6 members (1 leader + 5 members)');
      return;
    }

    const validMembers = verifiedMembers.filter(m => m.usn && m.dob);
    
    // Check for at least 2 different streams including team leader
    const allTeamMembers = teamLeader ? [teamLeader, ...validMembers] : validMembers;
    const streams = new Set(allTeamMembers.map(m => m.stream).filter(Boolean));
    
    if (streams.size < 2) {
      setErrorMessage('Team must have members from at least 2 different streams! Available streams: Computer Science Engineering, Electronics Engineering, Mechanical Engineering, Civil Engineering');
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
                  {teamLeader.name}
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
                  {teamLeader.stream}
                </p>
              </div>
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                  Section
                </p>
                <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                  {teamLeader.section}
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
                onChange={(e) => {
                  setTempUsn(e.target.value.toUpperCase());
                  setErrorMessage('');
                }}
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
                onChange={(e) => {
                  setTempDob(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="DDMMYY"
                maxLength={6}
                className="w-full h-[40px] border border-black rounded-[15px] px-4 bg-transparent focus:outline-none focus:ring-2 focus:ring-black"
                disabled={verifiedMembers.length >= 5 && editingIndex === null}
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-[12px] p-[12px] bg-red-100 border border-red-400 rounded-[10px]">
              <p className="font-['Inter',sans-serif] text-[12px] text-red-700 leading-[16px]">
                {errorMessage}
              </p>
            </div>
          )}

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
                      {member.name}
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
                      {member.stream}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      Section
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                      {member.section}
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