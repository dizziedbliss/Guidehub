import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { teamLeader, teamMembers, selectedGuide, setTeamId } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if incomplete (navigation guard)
  useEffect(() => {
    if (!teamLeader || teamMembers.length !== 5 || !selectedGuide) {
      navigate('/');
    }
  }, [teamLeader, teamMembers, selectedGuide, navigate]);

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
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to generate team ID');
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
        const errorData = await registerResponse.json();
        throw new Error(errorData.error || 'Failed to register team');
      }
      
      const registerData = await registerResponse.json();
      
      if (!registerData.success) {
        throw new Error(registerData.error || 'Failed to register team');
      }
      
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

  if (!teamLeader || teamMembers.length !== 5 || !selectedGuide) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-[#e9e9e9] relative w-full min-h-screen pb-12">
      <div className="relative w-full max-w-[420px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex items-center pt-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/guide')}
            className="w-[34px] h-[44px] cursor-pointer flex items-center justify-center mr-3"
            disabled={isSubmitting}
          >
            <ChevronLeft size={30} className="text-[#3b3b3b]" strokeWidth={2.5} />
          </button>
          
          <p className="font-['Cormorant',serif] font-bold leading-[64px] text-[#3b3b3b] text-[57px]">
            IP
          </p>
        </div>

        {/* Title */}
        <p className="font-['Cormorant',serif] font-normal leading-[44px] sm:leading-[52px] text-[#171717] text-[32px] sm:text-[40px] mt-8">
          Confirm the details
        </p>

        <div className="mt-8 space-y-8">
          {/* Guide Section */}
          {selectedGuide && (
            <div>
              <p className="font-['Cabin',sans-serif] font-normal leading-[36px] sm:leading-[44px] text-[#171717] text-[20px] sm:text-[24px] mb-4">
                Guide
              </p>
              <div className="relative min-h-[100px] w-full border border-[#3b3b3b] rounded-[15px] p-6">
                <div className="space-y-3">
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                      name
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1 break-words">
                      {selectedGuide.name}
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
              <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999] mb-6 sm:mb-8">
                {member.label}
              </p>
              <div className="relative w-full border border-[#3b3b3b] rounded-[15px] p-6">
                <div className="grid grid-cols-2 gap-x-4 gap-y-[12px]">
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      name
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-4 break-words">
                      {member.name || 'Max'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      usn
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-4 break-words">
                      {member.usn || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      stream
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-4">
                      {member.stream || 'Computer Science'}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      section
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-4">
                      {member.section || 'O'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
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
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-[10px]">
            <p className="text-red-600 text-[13px] font-['Inter',sans-serif]">
              <span className="font-semibold">Error:</span> {error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}