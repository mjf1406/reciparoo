/** @format */

// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core";

const ADMIN_EMAIL = "michael.fitzgerald.1406@gmail.com";

const bind = [
    "isAdmin",
    `auth.ref('$user.email')[0] == '${ADMIN_EMAIL}'`,
];

const rules = {
    attrs: {
        allow: {
            $default: "false",
        },
    },
    $files: {
        allow: {
            view: "true",
            create: "isAdmin",
            update: "isAdmin",
            delete: "isAdmin",
        },
        bind,
    },
    $users: {
        allow: {
            view: "true",
            create: `data.email == '${ADMIN_EMAIL}'`,
            update: "isAdmin",
            delete: "false",
        },
        bind,
    },
    recipes: {
        allow: {
            view: "true",
            create: "isAdmin",
            update: "isAdmin",
            delete: "isAdmin",
        },
        bind,
    },
    notes: {
        allow: {
            view: "true",
            create: "isAdmin",
            update: "isAdmin",
            delete: "isAdmin",
        },
        bind,
    },
    folders: {
        allow: {
            view: "true",
            create: "isAdmin",
            update: "isAdmin",
            delete: "isAdmin",
        },
        bind,
    },
} satisfies InstantRules;

export default rules;
