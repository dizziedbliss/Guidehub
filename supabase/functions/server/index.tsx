import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { supabase } from "./supabase-client.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper function to extract branch from USN
function extractBranchFromUSN(usn: string): string {
  // Format: 4MC23CS001 -> CS
  return usn.substring(5, 7);
}

// Helper function to map branch to stream
function mapBranchToStream(branch: string): string {
  const streamMap: Record<string, string> = {
    'CS': 'Computer Science Engineering',
    'CI': 'Computer Science Engineering',
    'CB': 'Computer Science Engineering',
    'EE': 'Electronics Engineering',
    'EC': 'Electronics Engineering',
    'VL': 'Electronics Engineering',
    'ME': 'Mechanical Engineering',
    'RI': 'Mechanical Engineering',
    'CV': 'Civil Engineering',
  };
  return streamMap[branch] || 'Unknown';
}

// Health check endpoint
app.get("/make-server-fdaa97b0/health", (c) => {
  return c.json({ status: "ok" });
});

// Verify student login (USN only, no DOB)
app.post("/make-server-fdaa97b0/verify-student", async (c) => {
  try {
    const body = await c.req.json();
    const { usn } = body;
    
    if (!usn) {
      return c.json({ success: false, error: 'USN is required' }, 400);
    }
    
    // Check if student exists
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('usn', usn)
      .single();
    
    if (error || !student) {
      console.error('Student verification error:', error);
      return c.json({ success: false, error: 'Invalid USN' }, 401);
    }
    
    // Check if student is already in a team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('usn', usn)
      .single();
    
    if (teamMember) {
      return c.json({ 
        success: false, 
        error: 'Student is already registered in a team',
        inTeam: true 
      }, 400);
    }
    
    return c.json({ 
      success: true, 
      student: {
        usn: student.usn,
        name: student.name,
        branch: student.branch,
        section: student.section,
        stream: student.stream
      }
    });
  } catch (error) {
    console.error('Error verifying student:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to verify student',
      details: error.message 
    }, 500);
  }
});

// Get all guides
app.get("/make-server-fdaa97b0/guides", async (c) => {
  try {
    const { data: guides, error } = await supabase
      .from('guides')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching guides:', error);
      return c.json({ success: false, error: 'Failed to fetch guides' }, 500);
    }
    
    // For each guide, count how many teams have selected them
    const guidesWithAvailability = await Promise.all(
      (guides || []).map(async (guide) => {
        const { count, error: countError } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('guide_email', guide.email);
        
        if (countError) {
          console.error('Error counting teams for guide:', guide.email, countError);
        }
        
        const currentCount = count || 0;
        const maxCapacity = guide.allocated_teams || 0;
        const available = currentCount < maxCapacity;
        const remainingSlots = Math.max(0, maxCapacity - currentCount);
        
        return {
          ...guide,
          currentTeams: currentCount,
          maxCapacity: maxCapacity,
          available: available,
          remainingSlots: remainingSlots
        };
      })
    );
    
    return c.json({ 
      success: true, 
      guides: guidesWithAvailability 
    });
  } catch (error) {
    console.error('Error fetching guides:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch guides',
      details: error.message 
    }, 500);
  }
});

// Initialize guides (one-time setup endpoint)
app.post("/make-server-fdaa97b0/init-guides", async (c) => {
  try {
    // Guide data from the CSV
    const guidesData = [
      { name: 'Dr. C. M. Naveen Kumar', department: 'CSBS', email: 'naveen.kumar@mce.ac.in', allocated_teams: 1 },
      { name: 'Niranjan Nayaka R K', department: 'Civil', email: 'niranjan.nayaka@mce.ac.in', allocated_teams: 1 },
      { name: 'Dr. Nanditha B R', department: 'ISE', email: 'nanditha.br@mce.ac.in', allocated_teams: 2 },
      { name: 'Dr. Arjun B C', department: 'CSE (AI & ML)', email: 'arjun.bc@mce.ac.in', allocated_teams: 2 },
      { name: 'Dr. Prakruthi HL', department: 'ECE', email: 'prakruthi.hl@mce.ac.in', allocated_teams: 1 },
      { name: 'Shruthi D V', department: 'ISE', email: 'shruthi.dv@mce.ac.in', allocated_teams: 1 },
      { name: 'Dr. Geetha Kiran A', department: 'CSE', email: 'geetha.kiran@mce.ac.in', allocated_teams: 2 },
      { name: 'Dr. Mohana Lakshmi J', department: 'EEE', email: 'mohana.lakshmi@mce.ac.in', allocated_teams: 2 },
      { name: 'Dr. Prathap P B', department: 'ECE', email: 'prathap.pb@mce.ac.in', allocated_teams: 2 },
      { name: 'Dr. Dhavala R K', department: 'EEE', email: 'dhavala.rk@mce.ac.in', allocated_teams: 1 },
      { name: 'Chaithra Chandrashekar', department: 'E&I', email: 'chaithra.c@mce.ac.in', allocated_teams: 1 },
      { name: 'B Uma', department: 'CSE (AI & ML)', email: 'uma.b@mce.ac.in', allocated_teams: 1 },
      { name: 'Dr. Vasundhara M G & Dr. Kalavathi G K', department: 'Mechanical', email: 'vasundhara.kalavathi@mce.ac.in', allocated_teams: 1 },
      { name: 'Sunitha P', department: 'CSE', email: 'sunitha.p@mce.ac.in', allocated_teams: 1 },
      { name: 'Dr. Yashaswini P R', department: 'ECE', email: 'yashaswini.pr@mce.ac.in', allocated_teams: 1 },
      { name: 'Margaret R E', department: 'CSE', email: 'margaret.re@mce.ac.in', allocated_teams: 1 },
      { name: 'Dr. Supriya M J', department: 'Civil', email: 'supriya.mj@mce.ac.in', allocated_teams: 1 },
      { name: 'Mrs. Reema Jasmin', department: 'CV', email: 'reema.jasmin@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Sagar C P', department: 'CV', email: 'sagar.cp@mce.ac.in', allocated_teams: 4 },
      { name: 'Ms. Siri Hemanth', department: 'CV', email: 'siri.hemanth@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Brundha B N', department: 'CV', email: 'brundha.bn@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Krishnaswaroop C D', department: 'CV', email: 'krishnaswaroop.cd@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Shrinidhi', department: 'CV', email: 'shrinidhi@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Tapaswi H V', department: 'CV', email: 'tapaswi.hv@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Madhushree C', department: 'CV', email: 'madhushree.c@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. M S Prathap', department: 'ME', email: 'ms.prathap@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. H S Ashrith', department: 'ME', email: 'hs.ashrith@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Shambulingam Murthy', department: 'ME', email: 'shambulingam.murthy@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. Shashank Lingappa', department: 'ME', email: 'shashank.lingappa@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Manjunath T', department: 'ME', email: 'manjunath.t@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. B N Sharath', department: 'ME', email: 'bn.sharath@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. S P Kruthi', department: 'E&E', email: 'sp.kruthi@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Pooja Suman', department: 'E&E', email: 'pooja.suman@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Swathy B A', department: 'E&E', email: 'swathy.ba@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. H V Prathima', department: 'E&E', email: 'hv.prathima@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Kiran Kumar Naik', department: 'E&E', email: 'kiran.kumar.naik@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Nagendra Prasad H K', department: 'E&E', email: 'nagendra.prasad@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Kavana K V', department: 'E&C', email: 'kavana.kv@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Mitha D', department: 'E&C', email: 'mitha.d@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. Ravikiran H K', department: 'E&C', email: 'ravikiran.hk@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Hemavardhini G M', department: 'E&C', email: 'hemavardhini.gm@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. Sushma N', department: 'E&C', email: 'sushma.n@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. Deepika K C', department: 'E&C', email: 'deepika.kc@mce.ac.in', allocated_teams: 4 },
      { name: 'Mr. Lokesh H S', department: 'FIRST YEAR', email: 'lokesh.hs@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. H C Priya', department: 'PHYSICS', email: 'hc.priya@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. K K Ramya', department: 'PHYSICS', email: 'kk.ramya@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. Samskruthi K P', department: 'CHEMISTRY', email: 'samskruthi.kp@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Sahana S', department: 'MATHEMATICS', email: 'sahana.s@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. Akshitha D N', department: 'CHEMISTRY', email: 'akshitha.dn@mce.ac.in', allocated_teams: 4 },
      { name: 'Dr. Ganesh D P', department: 'PHYSICS', email: 'ganesh.dp@mce.ac.in', allocated_teams: 4 },
      { name: 'Mrs. K R Girish', department: 'PHYSICS', email: 'kr.girish@mce.ac.in', allocated_teams: 4 }
    ];

    // Check if guides already exist
    const { data: existingGuides, error: checkError } = await supabase
      .from('guides')
      .select('email')
      .limit(1);

    if (checkError) {
      console.error('Error checking guides:', checkError);
      return c.json({ success: false, error: 'Failed to check guides' }, 500);
    }

    if (existingGuides && existingGuides.length > 0) {
      return c.json({ 
        success: false, 
        error: 'Guides already initialized' 
      }, 400);
    }

    // Insert all guides
    const { error: insertError } = await supabase
      .from('guides')
      .insert(guidesData);

    if (insertError) {
      console.error('Error inserting guides:', insertError);
      return c.json({ success: false, error: 'Failed to insert guides' }, 500);
    }

    return c.json({ 
      success: true, 
      message: `Successfully initialized ${guidesData.length} guides` 
    });
  } catch (error) {
    console.error('Error initializing guides:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to initialize guides',
      details: error.message 
    }, 500);
  }
});

// Generate next team ID
app.post("/make-server-fdaa97b0/generate-team-id", async (c) => {
  try {
    // Get current academic year (2025 for AY 2025-26)
    const currentYear = new Date().getFullYear();
    const yearSuffix = currentYear.toString().slice(-2); // "25" for 2025
    
    // Get the latest team ID counter from KV store
    const counterKey = `team_counter_${yearSuffix}`;
    const currentCounter = await kv.get(counterKey);
    
    // Increment counter (start from 1 if not exists)
    const nextNumber = currentCounter ? parseInt(currentCounter as string) + 1 : 1;
    
    // Format team ID: MCE{YY}IP{###}
    const teamId = `MCE${yearSuffix}IP${nextNumber.toString().padStart(3, '0')}`;
    
    // Store updated counter
    await kv.set(counterKey, nextNumber.toString());
    
    return c.json({ 
      success: true, 
      teamId,
      counter: nextNumber
    });
  } catch (error) {
    console.error('Error generating team ID:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to generate team ID',
      details: error.message 
    }, 500);
  }
});

// Store team registration
app.post("/make-server-fdaa97b0/register-team", async (c) => {
  try {
    const body = await c.req.json();
    const { teamId, teamLeader, teamMembers, selectedGuide } = body;
    
    if (!teamId) {
      return c.json({ success: false, error: 'Team ID is required' }, 400);
    }
    
    // Check if guide is still available
    const { data: guide, error: guideError } = await supabase
      .from('guides')
      .select('*')
      .eq('email', selectedGuide.email)
      .single();
    
    if (guideError || !guide) {
      console.error('Error fetching guide:', guideError);
      return c.json({ success: false, error: 'Guide not found' }, 404);
    }
    
    // Count current teams assigned to this guide
    const { count: currentTeams, error: countError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('guide_email', selectedGuide.email);
    
    if (countError) {
      console.error('Error counting teams:', countError);
      return c.json({ success: false, error: 'Failed to check guide availability' }, 500);
    }
    
    // Check if guide has reached capacity
    if ((currentTeams || 0) >= guide.allocated_teams) {
      return c.json({ 
        success: false, 
        error: 'This guide has reached maximum capacity. Please select another guide.',
        capacityFull: true 
      }, 400);
    }
    
    // Insert team into teams table
    const { error: teamError } = await supabase
      .from('teams')
      .insert({
        team_id: teamId,
        leader_usn: teamLeader.usn,
        guide_email: selectedGuide.email,
        registered_at: new Date().toISOString(),
      });
    
    if (teamError) {
      console.error('Error inserting team:', teamError);
      return c.json({ success: false, error: 'Failed to register team' }, 500);
    }
    
    // Insert all team members into team_members table
    const allMembers = [teamLeader, ...teamMembers];
    const memberInserts = allMembers.map(member => ({
      team_id: teamId,
      usn: member.usn,
      is_leader: member.usn === teamLeader.usn,
    }));
    
    const { error: membersError } = await supabase
      .from('team_members')
      .insert(memberInserts);
    
    if (membersError) {
      console.error('Error inserting team members:', membersError);
      // Rollback: delete the team if members insert fails
      await supabase.from('teams').delete().eq('team_id', teamId);
      return c.json({ success: false, error: 'Failed to register team members' }, 500);
    }
    
    // Also store in KV for backup/additional functionality
    await kv.set(`team_${teamId}`, JSON.stringify({
      teamId,
      teamLeader,
      teamMembers,
      selectedGuide,
      registeredAt: new Date().toISOString(),
    }));
    
    return c.json({ 
      success: true, 
      message: 'Team registered successfully',
      teamId 
    });
  } catch (error) {
    console.error('Error registering team:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to register team',
      details: error.message 
    }, 500);
  }
});

// Get team by ID
app.get("/make-server-fdaa97b0/team/:teamId", async (c) => {
  try {
    const teamId = c.req.param('teamId');
    const teamData = await kv.get(`team_${teamId}`);
    
    if (!teamData) {
      return c.json({ success: false, error: 'Team not found' }, 404);
    }
    
    return c.json({ 
      success: true, 
      team: JSON.parse(teamData as string) 
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return c.json({ 
      success: false, 
      error: 'Failed to fetch team',
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);