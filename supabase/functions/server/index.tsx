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
    'RB': 'Mechanical Engineering',
    'CV': 'Civil Engineering',
  };
  return streamMap[branch] || 'Unknown';
}

// Health check endpoint
app.get("/make-server-fdaa97b0/health", (c) => {
  return c.json({ status: "ok" });
});

// Verify student login (USN + DOB)
app.post("/make-server-fdaa97b0/verify-student", async (c) => {
  try {
    const body = await c.req.json();
    const { usn, dob } = body;
    
    if (!usn || !dob) {
      return c.json({ success: false, error: 'USN and DOB are required' }, 400);
    }
    
    // Check if student exists and DOB matches
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .eq('usn', usn)
      .eq('dob', dob)
      .single();
    
    if (error || !student) {
      console.error('Student verification error:', error);
      return c.json({ success: false, error: 'Invalid USN or DOB' }, 401);
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
        dob: student.dob,
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
    
    return c.json({ 
      success: true, 
      guides: guides || [] 
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