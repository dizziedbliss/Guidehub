// Helper functions for the application

/**
 * Extract branch code from USN
 * Format: 4MC23CS001 -> CS
 */
export function extractBranchCode(usn: string): string {
  if (!usn || usn.length < 7) return '';
  return usn.substring(5, 7);
}

/**
 * Map branch code to stream name
 */
export function mapBranchToStream(branch: string): string {
  const normalizedBranch = branch.trim().toUpperCase();
  const streamMap: Record<string, string> = {
    'CS': 'Computer Science Stream',
    'CI': 'Computer Science Stream',
    'CB': 'Computer Science Stream',
    'CV': 'Civil Engineering Stream',
    'ME': 'Mechanical Stream',
    'RI': 'Mechanical Stream',
    'EE': 'Electronics Stream',
    'EC': 'Electronics Stream',
    'VL': 'Electronics Stream',
  };
  return streamMap[normalizedBranch] || 'Unknown';
}

/**
 * Map branch code to full branch name
 */
export function BranchCodeToBranch(branch: string): string {
  const normalizedBranch = branch.trim().toUpperCase();
  const branchMap: Record<string, string> = {
    'CS': 'Computer Science and Engineering',
    'CI': 'Computer Science and Engineering (AIML)',
    'CB': 'Computer Science and Business Systems (CSBS)',
    'CV': 'Civil Engineering',
    'ME': 'Mechanical Engineering',
    'RI': 'Robotucs & Artificial Intelligence',
    'EE': 'Electrical and Electronics Engineering',
    'EC': 'Electronics and Communication Engineering',
    'VL': 'VLSI Design',
  };
  return branchMap[normalizedBranch] || 'Unknown';
}

/**
 * Validate USN format: 4MC{year}{branch}{roll}
 * Example: 4MC23CS003
 */
export function validateUSN(usn: string): boolean {
  const usnRegex = /^4MC\d{2}[A-Z]{2}\d{3}$/;
  return usnRegex.test(usn);
}