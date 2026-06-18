/** @format */

export const UNAUTHORIZED_MESSAGE =
    "Only the site owner can sign in. You can still browse recipes without an account.";

export const UNAUTHORIZED_SEARCH_PARAM = "unauthorized";

export function unauthorizedSearch() {
    return { [UNAUTHORIZED_SEARCH_PARAM]: "1" as const };
}
