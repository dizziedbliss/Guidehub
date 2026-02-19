import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext, TeamMember } from '../context/AppContext';
import { ChevronLeft, Pencil } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { validateUSN, validateDOB } from '../utils/helpers';

export default function TeamSelection() {
  const navigate = useNavigate();
  const { teamLeader, teamMembers, setTeamMembers } = useAppContext();
  
  const [verifiedMembers, setVerifiedMembers] = useState<TeamMember[]>(teamMembers);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempUsn, setTempUsn] = useState('');
  const [tempDob, setTempDob] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Redirect if no team leader (navigation guard)
  useEffect(() => {
    if (!teamLeader) {
      navigate('/');
    }
  }, [teamLeader, navigate]);

  const handleVerify = async () => {
    setErrorMessage('');
    setIsVerifying(true);
    
    const trimmedUSN = tempUsn.trim().toUpperCase();
    
    if (!trimmedUSN || !tempDob) {
      setErrorMessage('Please enter both USN and DOB.');
      setIsVerifying(false);
      return;
    }

    if (!validateUSN(trimmedUSN)) {
      setErrorMessage('Invalid USN format! Must be: 4MC{year}{branch}{roll} (e.g., 4MC23CS003)');
      setIsVerifying(false);
      return;
    }

    if (!validateDOB(tempDob)) {
      setErrorMessage('Invalid DOB format! Must be: DDMMYY (e.g., 150203 for 15th Feb 2003)');
      setIsVerifying(false);
      return;
    }
    
    // Check if team leader is trying to add themselves
    if (teamLeader && trimmedUSN === teamLeader.usn) {
      setErrorMessage('Team leader cannot be added as a team member!');
      setIsVerifying(false);
      return;
    }
    
    // Check for duplicate in current team (excluding the one being edited)
    const isDuplicate = verifiedMembers.some((member, idx) => 
      member.usn === trimmedUSN && idx !== editingIndex
    );
    
    if (isDuplicate) {
      setErrorMessage('This student is already added to your team!');
      setIsVerifying(false);
      return;
    }

    try {
      // Call backend API to verify student
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fdaa97b0/verify-student`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            usn: trimmedUSN,
            dob: tempDob,
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        if (data.inTeam) {
          setErrorMessage('This student is already part of another team!');
        } else {
          setErrorMessage(data.error || 'Invalid USN or Date of Birth. Please check credentials.');
        }
        setIsVerifying(false);
        return;
      }
      
      const studentData = data.student;

      const verifiedMember: TeamMember = {
        usn: studentData.usn,
        dob: tempDob,
        name: studentData.name,
        stream: studentData.stream,
        section: studentData.section,
      };

      if (editingIndex !== null && editingIndex < verifiedMembers.length) {
        // Update existing member
        const updated = [...verifiedMembers];
        updated[editingIndex] = verifiedMember;
        setVerifiedMembers(updated);
      } else {
        // Add new member
        setVerifiedMembers([...verifiedMembers, verifiedMember]);
      }
      
      setEditingIndex(null);
      setTempUsn('');
      setTempDob('');
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsVerifying(false);
    }
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

  if (!teamLeader) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-[#e9e9e9] relative w-full min-h-screen">
      <div className="relative w-full max-w-[420px] mx-auto px-6 sm:px-8 pb-12">
        {/* Header */}
        <div className="flex items-center pt-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/')}
            className="w-[34px] h-[44px] cursor-pointer flex items-center justify-center mr-3"
          >
            <ChevronLeft size={30} className="text-[#3b3b3b]" strokeWidth={2.5} />
          </button>
          
          <p className="font-['Cormorant',serif] font-bold leading-[64px] text-[#3b3b3b] text-[57px]">
            IP
          </p>
        </div>

        {/* Title */}
        <p className="font-['Cormorant',serif] font-normal leading-[44px] sm:leading-[52px] text-[#171717] text-[32px] sm:text-[40px] mt-6">
          Team Leader
        </p>

        {/* Team Leader Info Card */}
        {teamLeader && (
          <div className="mt-6 relative w-full border border-[#3b3b3b] rounded-[15px] p-5">
            <div className="grid grid-cols-2 gap-x-5 gap-y-4">
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                  Name
                </p>
                <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1 break-words">
                  {teamLeader.name}
                </p>
              </div>
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                  USN
                </p>
                <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1 break-words">
                  {teamLeader.usn}
                </p>
              </div>
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                  Stream
                </p>
                <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-1">
                  {teamLeader.stream}
                </p>
              </div>
              <div>
                <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                  Section
                </p>
                <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1">
                  {teamLeader.section}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Team Members Section */}
        <p className="font-['Cormorant',serif] font-normal leading-[44px] sm:leading-[52px] text-[#171717] text-[32px] sm:text-[40px] mt-12">
          Add Team Members
        </p>

        <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#999999] mt-4">
          {verifiedMembers.length}/5 Members Added
        </p>

        {/* Input Form */}
        <div className="mt-6">
          <div className="space-y-4 mb-4">
            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717] mb-3">
                University Seat Number
              </label>
              <input
                type="text"
                value={tempUsn}
                onChange={(e) => {
                  setTempUsn(e.target.value.toUpperCase());
                  setErrorMessage('');
                }}
                className="w-full h-[44px] border border-black rounded-[15px] px-5 bg-transparent focus:outline-none focus:ring-2 focus:ring-black text-[15px]"
                placeholder="4MCXXYYZZZ"
                disabled={(verifiedMembers.length >= 5 && editingIndex === null) || isVerifying}
              />
            </div>
            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717] mb-3">
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
                className="w-full h-[44px] border border-black rounded-[15px] px-5 bg-transparent focus:outline-none focus:ring-2 focus:ring-black text-[15px]"
                disabled={(verifiedMembers.length >= 5 && editingIndex === null) || isVerifying}
              />
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded-[12px]">
              <p className="font-['Inter',sans-serif] text-[13px] text-red-700 leading-[18px]">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            {editingIndex !== null && (
              <button
                onClick={handleCancelEdit}
                disabled={isVerifying}
                className="px-5 h-[36px] border border-black rounded-[12px] font-['Inter',sans-serif] font-semibold text-[#171717] text-[13px] hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleVerify}
              disabled={(verifiedMembers.length >= 5 && editingIndex === null) || isVerifying}
              className="px-5 h-[36px] bg-black rounded-[12px] font-['Inter',sans-serif] font-semibold text-[#e9e9e9] text-[13px] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
              {isVerifying ? 'Verifying...' : editingIndex !== null ? 'Save' : 'Verify'}
            </button>
          </div>
        </div>

        {/* Verified Members List */}
        {verifiedMembers.length > 0 && (
          <div className="mt-8 space-y-5">
            <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#999999]">
              Team Members
            </p>
            {verifiedMembers.map((member, index) => (
              <div
                key={index}
                className="relative w-full border border-[#3b3b3b] rounded-[15px] p-5 pr-14"
              >
                <div className="grid grid-cols-2 gap-x-5 gap-y-4">
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                      Name
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1 break-words">
                      {member.name}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                      USN
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1 break-words">
                      {member.usn}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                      Stream
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-1">
                      {member.stream}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                      Section
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1">
                      {member.section}
                    </p>
                  </div>
                </div>

                {/* Edit/Delete Buttons */}
                <div className="absolute top-5 right-5 flex flex-col gap-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="w-[28px] h-[28px] bg-black rounded-[8px] flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <Pencil size={14} className="text-[#e9e9e9]" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="w-[28px] h-[28px] border border-black rounded-[8px] flex items-center justify-center font-['Inter',sans-serif] font-bold text-[#171717] text-[16px] hover:bg-gray-100 transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleContinue}
            className="min-w-[120px] h-[36px] bg-black rounded-[12px] flex items-center justify-center font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[22px] px-6 hover:bg-gray-800 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}