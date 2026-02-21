import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext, Guide } from '../context/AppContext';
import { ChevronLeft, Search } from 'lucide-react';
import { projectId, publicAnonKey } from '/utils/supabase/info';

export default function GuideSelection() {
  const navigate = useNavigate();
  const { teamLeader, teamMembers, setSelectedGuide } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Redirect if team not completed (navigation guard)
  useEffect(() => {
    if (!teamLeader || teamMembers.length !== 5) {
      navigate('/');
    }
  }, [teamLeader, teamMembers, navigate]);

  // Fetch guides from backend
  useEffect(() => {
    const fetchGuides = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-fdaa97b0/guides`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch guides');
        }

        setGuides(data.guides);
      } catch (err) {
        console.error('Error fetching guides:', err);
        setError(err instanceof Error ? err.message : 'Failed to load guides');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  // Get unique departments from guides
  const departments = [
    'All Departments',
    ...Array.from(new Set(guides.map(g => g.department))).sort()
  ];

  // Filter guides by search query and department
  const filteredGuides = guides.filter((guide) => {
    const matchesSearch = guide.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === 'All Departments' || 
      guide.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleGuideSelect = (guide: Guide) => {
    const confirmed = window.confirm(
      'After selecting this guide, you cannot go back. Press OK to continue or Cancel to edit your selection.'
    );

    if (!confirmed) {
      return;
    }

    setSelectedGuide(guide);
    navigate('/confirm', { replace: true });
  };

  if (!teamLeader || teamMembers.length !== 5) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="bg-[#e9e9e9] relative w-full min-h-screen pb-12">
      <div className="relative w-full max-w-[420px] mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="flex items-center pt-6">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/team')}
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
          Select a Guide
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 rounded-[12px]">
            <p className="font-['Inter',sans-serif] text-[13px] text-red-700 leading-[18px]">
              {error}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="mt-12 text-center">
            <p className="font-['Cabin',sans-serif] text-[16px] text-[#999999]">
              Loading guides...
            </p>
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="mt-8 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#999999]" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name..."
                className="w-full h-[48px] bg-white border border-[#3b3b3b] rounded-[15px] pl-[50px] pr-5 font-['Cabin',sans-serif] text-[15px] text-[#171717] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3b3b3b]"
              />
            </div>

            {/* Department Filter */}
            <div className="mt-4 relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="relative w-full h-[48px] bg-[#3b3b3b] rounded-[15px] px-6 flex items-center justify-between font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[15px]"
              >
                <span className="truncate pr-8">{selectedDepartment}</span>
                <ChevronLeft 
                  className="absolute right-6 text-[#e9e9e9]" 
                  size={20}
                  style={{ 
                    transform: isFilterOpen ? 'rotate(-90deg)' : 'rotate(90deg)',
                    transition: 'transform 0.2s'
                  }}
                />
              </button>
              
              {/* Dropdown Menu */}
              {isFilterOpen && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-[#3b3b3b] rounded-[15px] overflow-hidden shadow-lg max-h-[300px] overflow-y-auto">
                  {departments.map((dept, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full px-6 py-3 text-left font-['Cabin',sans-serif] text-[15px] hover:bg-[#e9e9e9] transition-colors ${
                        selectedDepartment === dept ? 'bg-[#f5f5f5] text-[#171717] font-semibold' : 'text-[#171717]'
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Results Count */}
            <p className="mt-6 font-['Inter',sans-serif] font-semibold text-[13px] text-[#999999]">
              {filteredGuides.length} Guide{filteredGuides.length !== 1 ? 's' : ''} Found
            </p>

            {/* Guide Cards */}
            <div className="mt-5 space-y-6">
              {filteredGuides.length > 0 ? (
                filteredGuides.map((guide, index) => (
                  <div
                    key={index}
                    className={`relative min-h-[100px] w-full border rounded-[15px] p-6 ${
                      guide.available === false 
                        ? 'border-[#999999] bg-[#f5f5f5] opacity-60' 
                        : 'border-[#3b3b3b]'
                    }`}
                  >
                    <div className="space-y-3 pr-[100px]">
                      <div>
                        <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                          Name
                        </p>
                        <p className="font-['Cabin',sans-serif] text-[15px] text-[#171717] mt-1 break-words">
                          {guide.name}
                        </p>
                      </div>
                      <div>
                        <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999]">
                          {guide.department}
                        </p>
                      </div>
                    </div>
                    
                    {/* Select Button */}
                    <button
                      onClick={() => handleGuideSelect(guide)}
                      disabled={guide.available === false}
                      className={`absolute right-6 bottom-6 w-[90px] h-[32px] rounded-[10px] flex items-center justify-center font-['Inter',sans-serif] font-semibold text-[13px] transition-colors ${
                        guide.available === false
                          ? 'bg-[#cccccc] text-[#666666] cursor-not-allowed'
                          : 'bg-black text-[#e9e9e9] hover:bg-gray-800'
                      }`}
                    >
                      {guide.available === false ? 'Full' : 'Select'}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="font-['Cabin',sans-serif] text-[16px] text-[#999999]">
                    No guides found matching your search
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}