import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { extractBranchCode, mapBranchToStream, validateUSN } from '../utils/helpers';

export default function LoginForm() {
  const [seatNumber, setSeatNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [existingTeamData, setExistingTeamData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setTeamLeader, setTeamMembers, setSelectedGuide, setTeamId } = useAppContext();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setExistingTeamData(null);
    setIsLoading(true);
    
    const trimmedUSN = seatNumber.trim().toUpperCase();
    
    // Validate USN format
    if (!validateUSN(trimmedUSN)) {
      setErrorMessage('Invalid USN format! Must be: 4MC{year}{branch}{roll} (e.g., 4MC23CS003)');
      setIsLoading(false);
      return;
    }
    
    try {
      // Call backend API to verify student (USN only)
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
          }),
        }
      );
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        if (data.inTeam) {
          const existingTeam = data.team || null;

          if (data.isLeader && existingTeam) {
            setExistingTeamData(existingTeam);
            setErrorMessage('You are already a team leader. Open your existing application form?');
            setIsLoading(false);
            return;
          }

          setErrorMessage('This USN is already part of a team and cannot register again.');
        } else {
          setErrorMessage(data.error || 'Invalid USN. Please check your credentials.');
        }
        setIsLoading(false);
        return;
      }
      
      const studentData = data.student;
      const derivedStream = mapBranchToStream(extractBranchCode(studentData.usn));
      
      // Set team leader with verified student data
      setTeamLeader({
        usn: studentData.usn,
        name: studentData.name,
        stream: studentData.stream || derivedStream,
        section: studentData.section,
      });
      
      console.log('Login successful:', studentData);
      // Navigate to team selection page after login
      navigate('/team');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenExistingApplication = async () => {
    if (existingTeamData) {
      setTeamLeader(existingTeamData.teamLeader || null);
      setTeamMembers(existingTeamData.teamMembers || []);
      setSelectedGuide(existingTeamData.selectedGuide || null);
      setTeamId(existingTeamData.teamId || null);
      navigate('/application', { replace: true });
      return;
    }

    const trimmedUSN = seatNumber.trim().toUpperCase();
    if (!trimmedUSN) {
      return;
    }

    setIsLoading(true);
    try {
      const teamResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fdaa97b0/team-by-usn/${trimmedUSN}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const teamData = await teamResponse.json();
      if (!teamResponse.ok || !teamData.success || !teamData.team) {
        setErrorMessage(teamData.error || 'Could not load your existing application form.');
        return;
      }

      setTeamLeader(teamData.team.teamLeader || null);
      setTeamMembers(teamData.team.teamMembers || []);
      setSelectedGuide(teamData.team.selectedGuide || null);
      setTeamId(teamData.team.teamId || null);
      navigate('/application', { replace: true });
    } catch (err) {
      console.error('Load existing team error:', err);
      setErrorMessage('Could not load your existing application form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#e9e9e9] relative w-full h-full min-h-screen flex items-center justify-center px-6 sm:px-8 py-12">
      <div className="relative w-full max-w-[420px]">
        {/* Title */}
        <div className="font-['Cormorant',serif] font-bold leading-[56px] sm:leading-[64px] text-[#3b3b3b] text-[48px] sm:text-[57px]">
          <p className="mb-0">Interdisciplinary</p>
          <p>Project</p>
        </div>

        {/* Subtitle */}
        <p className="mt-6 font-['Cabin',sans-serif] font-normal leading-[36px] sm:leading-[44px] text-[#171717] text-[20px] sm:text-[24px]">
          Create Your Team
        </p>

        {/* Team Leader Notice */}
        <div className="mt-8 p-4 bg-[#0F0F0F] rounded-[12px]">
          <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#e9e9e9] leading-[18px]">
            Team Leader Login
          </p>
          <p className="font-['Inter',sans-serif] text-[11px] text-[#e9e9e9]/80 leading-[16px] mt-2">
            Please log in as the team leader. You will add other team members on the next page.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-12 sm:mt-16">
          {/* University Seat Number Field */}
          <div className="w-full mb-10">
            <label className="block font-['Inter',sans-serif] font-semibold text-[#171717] text-[13px] mb-[14px]">
              University Seat Number (Team Leader)
            </label>
            <input
              type="text"
              value={seatNumber}
              onChange={(e) => {
                setSeatNumber(e.target.value.toUpperCase());
                setErrorMessage('');
              }}
              className="w-full h-[44px] border border-black rounded-[15px] px-5 bg-transparent focus:outline-none focus:ring-2 focus:ring-black text-[15px]"
              required
              placeholder="4MCXXYYZZZ"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-[12px]">
              <p className="font-['Inter',sans-serif] text-[13px] text-red-700 leading-[18px]">
                {errorMessage}
              </p>
            </div>
          )}

          {existingTeamData && (
            <div className="mb-6 p-4 bg-[#f5f5f5] border border-[#3b3b3b] rounded-[12px]">
              <p className="font-['Inter',sans-serif] text-[13px] text-[#171717] leading-[18px] mb-3">
                You are already a team leader for Team ID: {existingTeamData.teamId}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleOpenExistingApplication}
                  disabled={isLoading}
                  className="min-w-[170px] h-[34px] bg-black rounded-[10px] flex items-center justify-center font-['Inter',sans-serif] font-semibold text-[#e9e9e9] text-[13px] hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  Open My Application
                </button>
              </div>
            </div>
          )}

          {/* Login Button */}
          <div className="flex justify-end mt-12">
            <button
              type="submit"
              disabled={isLoading}
              className="min-w-[120px] h-[36px] bg-black rounded-[12px] flex items-center justify-center font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[22px] px-6 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}