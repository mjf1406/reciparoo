import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Determines the user's role in a home.
 * Returns the highest priority role: owner > admin > member > viewer
 * Returns null if user is not associated with the home.
 */
export function getUserRoleInHome(
  home: {
    owner?: { id: string } | null;
    admins?: Array<{ id: string }> | null;
    homeMembers?: Array<{ id: string }> | null;
    viewers?: Array<{ id: string }> | null;
  } | null,
  userId: string | null | undefined
): "owner" | "admin" | "member" | "viewer" | null {
  if (!home || !userId) {
    return null;
  }

  // Check in priority order: owner > admin > member > viewer
  if (home.owner?.id === userId) {
    return "owner";
  }
  if (home.admins?.some((admin) => admin.id === userId)) {
    return "admin";
  }
  if (home.homeMembers?.some((member) => member.id === userId)) {
    return "member";
  }
  if (home.viewers?.some((viewer) => viewer.id === userId)) {
    return "viewer";
  }

  return null;
}
