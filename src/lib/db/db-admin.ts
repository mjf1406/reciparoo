/** @format */

// Initialize the database

import { init } from "@instantdb/admin";
import schema from "../../instant.schema";

const dbAdmin = init({
    appId: import.meta.env.VITE_INSTANT_APP_ID,
    adminToken: import.meta.env.INSTANT_APP_ADMIN_TOKEN,
    schema,
    useDateObjects: true,
});

export default dbAdmin;
