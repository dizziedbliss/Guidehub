import { createContext, useContext, useState, ReactNode } from 'react';

export interface TeamMember {
  usn: string;
  dob: string;
  name?: string;
  stream?: string;
  section?: string;
}

export interface Guide {
  name: string;
  email: string;
  phone: string;
  department: string;
}

interface AppContextType {
  teamLeader: TeamMember | null;
  setTeamLeader: (member: TeamMember | null) => void;
  teamMembers: TeamMember[];
  setTeamMembers: (members: TeamMember[]) => void;
  selectedGuide: Guide | null;
  setSelectedGuide: (guide: Guide | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [teamLeader, setTeamLeader] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  return (
    <AppContext.Provider
      value={{
        teamLeader,
        setTeamLeader,
        teamMembers,
        setTeamMembers,
        selectedGuide,
        setSelectedGuide,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}