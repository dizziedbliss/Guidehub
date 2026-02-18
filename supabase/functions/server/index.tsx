import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
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

// Health check endpoint
app.get("/make-server-fdaa97b0/health", (c) => {
  return c.json({ status: "ok" });
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
    
    // Store team data in KV store
    await kv.set(`team_${teamId}`, JSON.stringify({
      teamId,
      teamLeader,
      teamMembers,
      selectedGuide,
      registeredAt: new Date().toISOString(),
    }));
    
    // Mark all members as in team
    const allMembers = [teamLeader, ...teamMembers];
    for (const member of allMembers) {
      await kv.set(`inteam_${member.usn}`, 'true');
    }
    
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