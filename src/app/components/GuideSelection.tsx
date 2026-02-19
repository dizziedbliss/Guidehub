import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAppContext, Guide } from '../context/AppContext';
import { ChevronLeft, Search } from 'lucide-react';

// Mock data for guides - In production, this would be fetched from Supabase
const mockGuides: Guide[] = [
  { name: 'Dr. Ramesh Iyer', email: 'ramesh.iyer@mce.edu', department: 'Computer Science Engineering' },
  { name: 'Dr. Kavita Rao', email: 'kavita.rao@mce.edu', department: 'Artificial Intelligence and Machine Learning' },
  { name: 'Dr. Anil Kumar', email: 'anil.kumar@mce.edu', department: 'Electrical & Electronics Engineering' },
  { name: 'Dr. Snehalatha', email: 'snehalatha@mce.edu', department: 'Electronics & Communication Engineering' },
  { name: 'Dr. Mohan Patil', email: 'mohan.patil@mce.edu', department: 'Mechanical Engineering' },
  { name: 'Dr. Vivek Sharma', email: 'vivek.sharma@mce.edu', department: 'Civil Engineering' },
  { name: 'Dr. Pradeep N', email: 'pradeep.n@mce.edu', department: 'Robotics & AI Engineering' },
  { name: 'Dr. Meenakshi Rao', email: 'meenakshi.rao@mce.edu', department: 'VLSI Engineering' },
  { name: 'Dr. Sunil Bhat', email: 'sunil.bhat@mce.edu', department: 'Computer Science & Business System' },
  { name: 'Dr. Arpita Jain', email: 'arpita.jain@mce.edu', department: 'Artificial Intelligence and Machine Learning' },
  { name: 'Dr. Kiran Hegde', email: 'kiran.hegde@mce.edu', department: 'Physics' },
  { name: 'Dr. Lakshmi N', email: 'lakshmi.n@mce.edu', department: 'Chemistry' },
  { name: 'Dr. Deepa Menon', email: 'deepa.menon@mce.edu', department: 'Mathematics' },
  { name: 'Dr. Rahul Verma', email: 'rahul.verma@mce.edu', department: 'Physics' },
  { name: 'Dr. Pooja Shetty', email: 'pooja.shetty@mce.edu', department: 'Chemistry' },
  { name: 'Dr. Gopal Rao', email: 'gopal.rao@mce.edu', department: 'Mathematics' },
  { name: 'Dr. Harish Kulkarni', email: 'harish.k@mce.edu', department: 'Computer Science Engineering' },
  { name: 'Dr. Neha Patil', email: 'neha.patil@mce.edu', department: 'Artificial Intelligence and Machine Learning' },
  { name: 'Dr. Shankar Iyer', email: 'shankar.iyer@mce.edu', department: 'Electrical & Electronics Engineering' },
  { name: 'Dr. Ritu Sharma', email: 'ritu.sharma@mce.edu', department: 'Robotics & AI Engineering' },
];

const departments = [
  'All Departments',
  'Computer Science Engineering',
  'Computer Science & Business System',
  'Artificial Intelligence and Machine Learning',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'VLSI Engineering',
  'Mechanical Engineering',
  'Robotics & AI Engineering',
  'Civil Engineering',
  'Physics',
  'Chemistry',
  'Mathematics',
];

export default function GuideSelection() {
  const navigate = useNavigate();
  const { teamLeader, teamMembers, setSelectedGuide } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Redirect if team not completed (navigation guard)
  useEffect(() => {
    if (!teamLeader || teamMembers.length !== 5) {
      navigate('/');
    }
  }, [teamLeader, teamMembers, navigate]);

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

        {/* Search Bar */}
        <div className="mt-8 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#999999]" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Name or Email..."
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
                className="relative min-h-[140px] w-full border border-[#3b3b3b] rounded-[15px] p-6"
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
                    <p className="font-['Inter',sans-serif] font-semibold text-[13px] text-[#171717]">
                      Email
                    </p>
                    <p className="font-['Cabin',sans-serif] text-[14px] text-[#171717] mt-1 break-words">
                      {guide.email}
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
                  className="absolute right-6 bottom-6 w-[90px] h-[32px] bg-black rounded-[10px] flex items-center justify-center font-['Inter',sans-serif] font-semibold text-[#e9e9e9] text-[13px] hover:bg-gray-800 transition-colors"
                >
                  Select
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
      </div>
    </div>
  );
}