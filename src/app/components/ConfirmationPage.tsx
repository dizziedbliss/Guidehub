import { useNavigate } from 'react-router';
import { useAppContext } from '../context/AppContext';
import { ChevronLeft } from 'lucide-react';

export default function ConfirmationPage() {
  const navigate = useNavigate();
  const { teamLeader, teamMembers, selectedGuide } = useAppContext();

  const handleSubmit = () => {
    console.log('Final submission:', {
      teamLeader,
      teamMembers,
      selectedGuide,
    });
    alert('Team and guide selection submitted successfully!');
    navigate('/');
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
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      phone no.
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[2px]">
                      {selectedGuide.phone}
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
            className="w-[111px] h-[30px] bg-black rounded-[10px] flex items-center justify-center font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[24px] leading-[44px] hover:bg-gray-800 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}