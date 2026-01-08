/** @format */

// Initialize the database

import { init } from "@instantdb/react";
import schema from "../../instant.schema";

const appId = import.meta.env.VITE_INSTANT_APP_ID;

if (!appId) {
    console.error(
        "VITE_INSTANT_APP_ID is not set. Please set it in your .env file."
    );
}

const db = init({
    appId: appId || "",
    schema,
    useDateObjects: true,
});

export { db };
export default db;
