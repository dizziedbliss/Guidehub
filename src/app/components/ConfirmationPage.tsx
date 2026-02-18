import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft } from 'lucide-react';
import { mockStudentDatabase } from './LoginForm';
import { useState } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { teamLeader, teamMembers, selectedGuide, setTeamId } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Step 1: Generate team ID
      const generateResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fdaa97b0/generate-team-id`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!generateResponse.ok) {
        throw new Error('Failed to generate team ID');
      }
      
      const generateData = await generateResponse.json();
      
      if (!generateData.success) {
        throw new Error(generateData.error || 'Failed to generate team ID');
      }
      
      const generatedTeamId = generateData.teamId;
      console.log('Generated Team ID:', generatedTeamId);
      
      // Step 2: Register team in database
      const registerResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-fdaa97b0/register-team`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            teamId: generatedTeamId,
            teamLeader,
            teamMembers,
            selectedGuide,
          }),
        }
      );
      
      if (!registerResponse.ok) {
        throw new Error('Failed to register team');
      }
      
      const registerData = await registerResponse.json();
      
      if (!registerData.success) {
        throw new Error(registerData.error || 'Failed to register team');
      }
      
      // Update local mock database for demo purposes
      if (teamLeader && mockStudentDatabase[teamLeader.usn]) {
        mockStudentDatabase[teamLeader.usn].inTeam = true;
      }
      
      teamMembers.forEach(member => {
        if (mockStudentDatabase[member.usn]) {
          mockStudentDatabase[member.usn].inTeam = true;
        }
      });
      
      // Store team ID in context
      setTeamId(generatedTeamId);
      
      console.log('Team registered successfully:', {
        teamId: generatedTeamId,
        teamLeader,
        teamMembers,
        selectedGuide,
      });
      
      // Navigate to application letter generation
      navigate('/application');
    } catch (err) {
      console.error('Error during team submission:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create an array with team leader and all members
  const allMembers = [
    { ...teamLeader, label: 'Team Leader' },
    ...teamMembers.map((m, i) => ({ ...m, label: `Team Member ${i + 1}` })),
  ];

  return (
    <div className="bg-[#e9e9e9] relative w-full min-h-screen pb-[40px]">
      <div className="relative w-full max-w-[398px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex items-center pt-[16px]">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/guide')}
            className="w-[30px] h-[42px] cursor-pointer flex items-center justify-center mr-2"
          >
            <ChevronLeft size={30} className="text-[#3b3b3b]" strokeWidth={2.5} />
          </button>
          
          <p className="font-['Cormorant',serif] font-bold leading-[64px] text-[#3b3b3b] text-[57px]">
            IP
          </p>
        </div>

        {/* Title */}
        <p className="font-['Cormorant',serif] font-normal leading-[44px] sm:leading-[52px] text-[#171717] text-[32px] sm:text-[40px] mt-[20px] sm:mt-[30px]">
          Confirm the details
        </p>

        <div className="mt-[24px] sm:mt-[35px] space-y-[20px] sm:space-y-[27px]">
          {/* Guide Section */}
          {selectedGuide && (
            <div>
              <p className="font-['Cabin',sans-serif] font-normal leading-[36px] sm:leading-[44px] text-[#171717] text-[20px] sm:text-[24px] mb-[6px]">
                Guide
              </p>
              <div className="relative min-h-[96px] w-full border border-[#3b3b3b] rounded-[15px] p-[16px] sm:p-[21px]">
                <div className="space-y-[4px]">
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      name
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[2px] break-words">
                      {selectedGuide.name}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      email
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[2px] break-words">
                      {selectedGuide.email}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999]">
                      {selectedGuide.department}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Team Members Section */}
          {allMembers.map((member, index) => (
            <div key={index}>
              <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999] mb-[16px] sm:mb-[25px]">
                {member.label}
              </p>
              <div className="relative w-full border border-[#3b3b3b] rounded-[15px] p-[16px]">
                <div className="grid grid-cols-2 gap-x-4 gap-y-[12px]">
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      name
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                      {member.name || 'Max'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      usn
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                      {member.usn || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      stream
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                      {member.stream || 'Computer Science'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      section
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                      {member.section || 'O'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-[20px] sm:mt-[27px]">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-[111px] h-[30px] bg-black rounded-[10px] flex items-center justify-center font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[24px] leading-[44px] hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '...' : 'Submit'}
          </button>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mt-[10px] p-[12px] bg-red-50 border border-red-200 rounded-[10px]">
            <p className="text-red-600 text-[13px] font-['Inter',sans-serif]">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}