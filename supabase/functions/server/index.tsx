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
    'CV': 'Civil Engineering',
    'ME': 'Mechanical Engineering',
    'RI': 'Mechanical Engineering',
    'RB': 'Mechanical Engineering',
    'EE': 'Electronics Engineering',
    'EC': 'Electronics Engineering',
    'VL': 'Electronics Engineering',
  };
  return streamMap[branch] || 'Unknown';
}

async function buildTeamPayloadByLeaderUsn(usn: string) {
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .eq('leader_usn', usn)
    .order('registered_at', { ascending: false })
    .limit(1);

  if (teamsError) {
    return { error: teamsError, team: null };
  }

  const team = teams?.[0];
  if (!team) {
    return { error: null, team: null };
  }

  const { data: teamMembersRows, error: membersError } = await supabase
    .from('team_members')
    .select('usn,is_leader')
    .eq('team_id', team.team_id);

  if (membersError || !teamMembersRows || teamMembersRows.length === 0) {
    return { error: membersError || new Error('No team members found'), team: null };
  }

  const typedTeamMembersRows = teamMembersRows as Array<{ usn: string; is_leader: boolean }>;

  const memberUsns = typedTeamMembersRows.map(member => member.usn);
  const { data: studentsRows, error: studentsError } = await supabase
    .from('students')
    .select('usn,name,section')
    .in('usn', memberUsns);

  if (studentsError || !studentsRows) {
    return { error: studentsError || new Error('Student details not found'), team: null };
  }

  const typedStudentsRows = studentsRows as Array<{ usn: string; name: string; section: string }>;

  const studentsByUsn = new Map(typedStudentsRows.map(student => [student.usn, student]));

  const leaderRow = typedTeamMembersRows.find(member => member.is_leader) || typedTeamMembersRows.find(member => member.usn === team.leader_usn);
  if (!leaderRow) {
    return { error: new Error('Team leader record not found'), team: null };
  }

  const leaderStudent = studentsByUsn.get(leaderRow.usn);
  const teamLeader = {
    usn: leaderRow.usn,
    name: leaderStudent?.name || 'Unknown',
    section: leaderStudent?.section || 'N/A',
    stream: mapBranchToStream(extractBranchFromUSN(leaderRow.usn)),
  };

  const teamMembers = typedTeamMembersRows
    .filter(member => member.usn !== leaderRow.usn)
    .map(member => {
      const student = studentsByUsn.get(member.usn);
      return {
        usn: member.usn,
        name: student?.name || 'Unknown',
        section: student?.section || 'N/A',
        stream: mapBranchToStream(extractBranchFromUSN(member.usn)),
      };
    });

  let selectedGuide = null;
  const parsedGuideId = Number(team.guide_id);
  const guideQueryValue = Number.isNaN(parsedGuideId) ? team.guide_id : parsedGuideId;
  const { data: guideRow, error: guideError } = await supabase
    .from('guides')
    .select('*')
    .eq('id', guideQueryValue)
    .maybeSingle();

  if (guideError) {
    console.error('Error fetching guide for team:', team.team_id, guideError);
  } else if (guideRow) {
    selectedGuide = guideRow;
  }

  return {
    error: null,
    team: {
      teamId: team.team_id,
      teamLeader,
      teamMembers,
      selectedGuide,
    },
  };
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
    
    // Check if student exists (fetch only required fields)
    const { data: student, error } = await supabase
      .from('students')
      .select('usn,name,section')
      .eq('usn', usn)
      .single();
    
    if (error || !student) {
      console.error('Student verification error:', error);
      return c.json({ success: false, error: 'Invalid USN' }, 401);
    }
    
    // Check if student is already in a team (count-based, robust even with bad duplicate rows)
    const { count: existingTeamCount, error: teamCountError } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('usn', usn);

    if (teamCountError) {
      console.error('Error checking existing team membership:', teamCountError);
      return c.json({ success: false, error: 'Failed to verify team membership' }, 500);
    }

    if ((existingTeamCount || 0) > 0) {
      const { team, error: existingTeamError } = await buildTeamPayloadByLeaderUsn(usn);
      if (existingTeamError) {
        console.error('Error building existing team payload:', existingTeamError);
      }

      return c.json({ 
        success: false, 
        error: 'Student is already registered in a team',
        inTeam: true,
        isLeader: !!team,
        team: team || null,
      }, 400);
    }
    
    const branchCode = extractBranchFromUSN(student.usn);
    const stream = mapBranchToStream(branchCode);

    return c.json({ 
      success: true, 
      student: {
        usn: student.usn,
        name: student.name,
        section: student.section,
        stream
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

// Get registered team details by team leader USN
app.get("/make-server-fdaa97b0/team-by-usn/:usn", async (c) => {
  try {
    const usn = c.req.param('usn');

    if (!usn) {
      return c.json({ success: false, error: 'USN is required' }, 400);
    }

    const { team, error } = await buildTeamPayloadByLeaderUsn(usn);

    if (error) {
      console.error('Error fetching team by USN:', error);
      return c.json({ success: false, error: 'Failed to fetch team' }, 500);
    }

    if (!team) {
      return c.json({ success: false, error: 'No registered team found for this USN' }, 404);
    }

    return c.json({
      success: true,
      team,
    });
  } catch (error) {
    console.error('Error in team-by-usn:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch team by USN',
      details: error.message,
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

    const { data: slotRows, error: slotsError } = await supabase
      .from('guide_slots')
      .select('guide_id,used_slots,max_slots');

    if (slotsError) {
      console.warn('guide_slots not available or failed to load, using teams count fallback:', slotsError.message);
    }

    const slotsByGuideId = new Map<string, { guide_id: string; used_slots: number | null; max_slots: number | null }>(
      ((slotRows || []) as Array<{ guide_id: string; used_slots: number | null; max_slots: number | null }>).map((slot) => [
        String(slot.guide_id),
        slot,
      ])
    );
    
    // For each guide, count how many teams have selected them
    const guidesWithAvailability = await Promise.all(
      (guides || []).map(async (guide) => {
        const slotInfo = slotsByGuideId.get(String(guide.id));
        const { count, error: countError } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('guide_id', String(guide.id));
        
        if (countError) {
          console.error('Error counting teams for guide:', guide.id, countError);
        }
        
        const fallbackCurrentCount = count || 0;
        const currentCount = typeof slotInfo?.used_slots === 'number' ? slotInfo.used_slots : fallbackCurrentCount;

        const slotMaxCapacity = typeof slotInfo?.max_slots === 'number' && slotInfo.max_slots > 0 ? slotInfo.max_slots : null;
        const guideMaxCapacity = typeof guide.allocated_teams === 'number' && guide.allocated_teams > 0 ? guide.allocated_teams : null;
        const maxCapacity = slotMaxCapacity ?? guideMaxCapacity;
        const available = maxCapacity === null ? true : currentCount < maxCapacity;
        const remainingSlots = maxCapacity === null ? null : Math.max(0, maxCapacity - currentCount);
        
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

    if (!selectedGuide) {
      return c.json({ success: false, error: 'Guide details are required' }, 400);
    }
    
    // Resolve guide: prefer id, fallback to name+department
    let guide = null;
    let guideError = null;

    if (selectedGuide.id !== undefined && selectedGuide.id !== null && String(selectedGuide.id).trim() !== '') {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('id', selectedGuide.id)
        .maybeSingle();

      guide = data;
      guideError = error;
    }

    if (!guide && selectedGuide.name && selectedGuide.department) {
      const { data, error } = await supabase
        .from('guides')
        .select('*')
        .eq('name', selectedGuide.name)
        .eq('department', selectedGuide.department)
        .maybeSingle();

      guide = data;
      guideError = error;
    }
    
    if (guideError || !guide) {
      console.error('Error fetching guide:', guideError);
      return c.json({ success: false, error: 'Guide not found' }, 404);
    }

    const resolvedGuideId = String(guide.id);
    
    // Count current teams assigned to this guide
    const { count: currentTeams, error: countError } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('guide_id', resolvedGuideId);
    
    if (countError) {
      console.error('Error counting teams:', countError);
      return c.json({ success: false, error: 'Failed to check guide availability' }, 500);
    }
    
    // Check if guide has reached capacity
    const hasCapacity = typeof guide.allocated_teams === 'number' && guide.allocated_teams > 0;
    if (hasCapacity && (currentTeams || 0) >= guide.allocated_teams) {
      return c.json({ 
        success: false, 
        error: 'This guide has reached maximum capacity. Please select another guide.',
        capacityFull: true 
      }, 400);
    }
    
    const allMembers = [teamLeader, ...teamMembers];
    const allUsns = allMembers.map(member => member.usn);

    // Final server-side guard: ensure none of these USNs already exist in any team
    const { data: existingMembers, error: existingMembersError } = await supabase
      .from('team_members')
      .select('usn,team_id')
      .in('usn', allUsns);

    if (existingMembersError) {
      console.error('Error checking duplicate members before registration:', existingMembersError);
      return c.json({ success: false, error: 'Failed to validate team members' }, 500);
    }

    if (existingMembers && existingMembers.length > 0) {
      return c.json({
        success: false,
        error: 'One or more students are already part of another team',
        inTeam: true,
        conflicts: existingMembers,
      }, 400);
    }

    // Insert team into teams table
    const { error: teamError } = await supabase
      .from('teams')
      .insert({
        team_id: teamId,
        leader_usn: teamLeader.usn,
        guide_id: resolvedGuideId,
        registered_at: new Date().toISOString(),
      });
    
    if (teamError) {
      console.error('Error inserting team:', teamError);
      return c.json({ success: false, error: 'Failed to register team' }, 500);
    }
    
    // Insert all team members into team_members table
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

    // Update guide slot usage tracker (non-blocking fallback if table not present yet)
    const { error: slotUpdateError } = await supabase
      .from('guide_slots')
      .upsert(
        {
          guide_id: resolvedGuideId,
          used_slots: (currentTeams || 0) + 1,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'guide_id' }
      );

    if (slotUpdateError) {
      console.warn('Could not update guide_slots tracker:', slotUpdateError.message);
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