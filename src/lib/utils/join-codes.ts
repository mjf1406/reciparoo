/** @format */

/**
 * Generate a random alphanumeric join code
 * @param length - Length of the code (default: 6)
 * @returns Uppercase alphanumeric code
 */
export function generateJoinCode(length: number = 6): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars like 0, O, I, 1
    let code = "";
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
        code += chars[array[i] % chars.length];
    }
    
    return code;
}

/**
 * Format a join code for display (e.g., add dashes)
 * @param code - The join code to format
 * @returns Formatted code string
 */
export function formatJoinCode(code: string): string {
    // For now, just return uppercase. Can add dashes later if needed
    return code.toUpperCase();
}

/**
 * Generate an invite link for a join code
 * @param code - The join code
 * @returns Full URL for the invite link
 */
export function generateInviteLink(code: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/join?code=${encodeURIComponent(code)}`;
}
