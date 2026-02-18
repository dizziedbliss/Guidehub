import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext, Guide } from '../context/AppContext';
import { ChevronLeft, Search } from 'lucide-react';

// Mock data for guides
const mockGuides: Guide[] = [
  {
    name: 'A Geetha Kiran',
    email: 'agk@ms.mcehassan.ac.in',
    phone: '1023981293',
    department: 'Computer Science Engineering',
  },
  {
    name: 'Dr. Rajesh Kumar',
    email: 'rk@ms.mcehassan.ac.in',
    phone: '9876543210',
    department: 'Computer Science Engineering',
  },
  {
    name: 'Prof. Anita Sharma',
    email: 'as@ms.mcehassan.ac.in',
    phone: '8765432109',
    department: 'Computer Science Engineering',
  },
  {
    name: 'Dr. Suresh Patil',
    email: 'sp@ms.mcehassan.ac.in',
    phone: '7654321098',
    department: 'Artificial intelligence & Machine learning',
  },
  {
    name: 'Prof. Lakshmi Devi',
    email: 'ld@ms.mcehassan.ac.in',
    phone: '6543210987',
    department: 'Mechanical Engineering',
  },
  {
    name: 'Dr. Vinay Reddy',
    email: 'vr@ms.mcehassan.ac.in',
    phone: '5432109876',
    department: 'Electrical Engineering',
  },
  {
    name: 'Dr. Priya Menon',
    email: 'pm@ms.mcehassan.ac.in',
    phone: '9988776655',
    department: 'Artificial intelligence & Machine learning',
  },
  {
    name: 'Prof. Arjun Nair',
    email: 'an@ms.mcehassan.ac.in',
    phone: '8877665544',
    department: 'Computer Science Engineering',
  },
];

const departments = [
  'All Departments',
  'Computer Science Engineering',
  'Artificial intelligence & Machine learning',
  'Mechanical Engineering',
  'Electrical Engineering',
];

export default function GuideSelection() {
  const navigate = useNavigate();
  const { setSelectedGuide } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter guides by search query and department
  const filteredGuides = mockGuides.filter((guide) => {
    const matchesSearch = 
      guide.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      selectedDepartment === 'All Departments' || 
      guide.department === selectedDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const handleGuideSelect = (guide: Guide) => {
    setSelectedGuide(guide);
    navigate('/confirm');
  };

  return (
    <div className="bg-[#e9e9e9] relative w-full min-h-screen pb-[40px]">
      <div className="relative w-full max-w-[398px] mx-auto px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex items-center pt-[16px]">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/team')}
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
          Select a Guide
        </p>

        {/* Search Bar */}
        <div className="mt-[24px] sm:mt-[30px] relative">
          <Search className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#999999]" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name or Email..."
            className="w-full h-[44px] bg-white border border-[#3b3b3b] rounded-[15px] pl-[45px] pr-[16px] font-['Cabin',sans-serif] text-[14px] text-[#171717] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3b3b3b]"
          />
        </div>

        {/* Department Filter */}
        <div className="mt-[12px] relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="relative w-full h-[44px] bg-[#3b3b3b] rounded-[15px] px-[22px] flex items-center justify-between font-['Cabin',sans-serif] font-normal text-[#e9e9e9] text-[14px]"
          >
            <span className="truncate pr-[30px]">{selectedDepartment}</span>
            <ChevronLeft 
              className="absolute right-[22px] text-[#e9e9e9]" 
              size={20}
              style={{ 
                transform: isFilterOpen ? 'rotate(-90deg)' : 'rotate(90deg)',
                transition: 'transform 0.2s'
              }}
            />
          </button>
          
          {/* Dropdown Menu */}
          {isFilterOpen && (
            <div className="absolute z-10 w-full mt-[4px] bg-white border border-[#3b3b3b] rounded-[15px] overflow-hidden shadow-lg">
              {departments.map((dept, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSelectedDepartment(dept);
                    setIsFilterOpen(false);
                  }}
                  className={`w-full px-[22px] py-[12px] text-left font-['Cabin',sans-serif] text-[14px] hover:bg-[#e9e9e9] transition-colors ${
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
        <p className="mt-[20px] font-['Inter',sans-serif] font-semibold text-[12px] text-[#999999]">
          {filteredGuides.length} Guide{filteredGuides.length !== 1 ? 's' : ''} Found
        </p>

        {/* Guide Cards */}
        <div className="mt-[16px] space-y-[24px] sm:space-y-[35px]">
          {filteredGuides.length > 0 ? (
            filteredGuides.map((guide, index) => (
              <div
                key={index}
                className="relative min-h-[136px] w-full border border-[#3b3b3b] rounded-[15px] p-[21px]"
              >
                <div className="space-y-[8px] pr-[100px]">
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      Name
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                      {guide.name}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      Email
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px] break-words">
                      {guide.email}
                    </p>
                  </div>
                  <div>
                    <p className="font-['Inter',sans-serif] font-semibold text-[12px] text-[#171717]">
                      Phone No.
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-[4px]">
                      {guide.phone}
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
                  className="absolute right-[21px] bottom-[21px] w-[86px] h-[25px] bg-black rounded-[8px] flex items-center justify-center font-['Inter',sans-serif] font-semibold text-[#e9e9e9] text-[12px] hover:bg-gray-800 transition-colors"
                >
                  Select
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-[40px]">
              <p className="font-['Cabin',sans-serif] text-[16px] text-[#999999]">
                No guides found matching your search
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}