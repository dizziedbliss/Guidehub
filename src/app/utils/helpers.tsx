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
  return streamMap[normalizedBranch] || 'Unknown';
}

/**
 * Validate USN format: 4MC{year}{branch}{roll}
 * Example: 4MC23CS003
 */
export function validateUSN(usn: string): boolean {
  const usnRegex = /^4MC\d{2}[A-Z]{2}\d{3}$/;
  return usnRegex.test(usn);
}