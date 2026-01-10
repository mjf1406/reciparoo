/** @format */

// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/core";

const _schema = i.schema({
    entities: {
        $files: i.entity({
            path: i.string().unique().indexed(),
            url: i.string(),
        }),
        $users: i.entity({
            // System Columns
            email: i.string().unique().indexed().optional(),
            imageURL: i.string().optional(),
            type: i.string().optional(),
            // Custom Columns
            avatarURL: i.string().optional(),
            plan: i.string().optional(),
            firstName: i.string().optional(),
            lastName: i.string().optional(),
            created: i.date().optional(),
            updated: i.date().optional(),
            lastLogon: i.date().optional(),
        }),
        homes: i.entity({
            name: i.string().indexed(),
            description: i.string().optional(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
        joinCodes: i.entity({
            code: i.string().unique().indexed(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
        joinCodeRequests: i.entity({
            email: i.string().unique().indexed(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
    },
    links: {
        // ------------------------
        //        User Links
        // ------------------------
        userFiles: {
            forward: {
                on: "$files",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            }, // Each file has one owner, which is a user id
            reverse: {
                on: "$users",
                has: "many",
                label: "files",
            }, // Each user can have many files
        },
        userHomes: {
            forward: {
                on: "homes",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            }, // Each home has one owner who created it, which is a user id
            reverse: {
                on: "$users",
                has: "many",
                label: "homes",
            }, // Each user can have many homes
        },
        // ------------------------
        //       Home Links
        // ------------------------
        homeAdmins: {
            forward: {
                on: "homes",
                has: "many",
                label: "admins",
            }, // Each home can have many admin users
            reverse: {
                on: "$users",
                has: "many",
                label: "adminHomes",
            }, // Each user can be an admin of many homes
        },
        homeMembers: {
            forward: {
                on: "homes",
                has: "many",
                label: "homeMembers",
            }, // Each home can have many member users
            reverse: {
                on: "$users",
                has: "many",
                label: "memberHomes",
            }, // Each user can be a member of many homes
        },
        // ------------------------
        //   Home Join Code Links
        // ------------------------
        homeJoinCode: {
            forward: {
                on: "joinCodes", // Each join code
                has: "one", // has one
                label: "home", // home
                onDelete: "cascade",
            },
            reverse: {
                on: "homes", // Each home
                has: "many", // has many
                label: "joinCodes", // join codes
            },
        },
        joinCodeRequests: {
            forward: {
                on: "joinCodeRequests", // Each join code request
                has: "one", // has one
                label: "joinCode", // join code
                onDelete: "cascade",
            },
            reverse: {
                on: "joinCodes", // Each join code
                has: "many", // has many
                label: "joinCodeRequests", // join code requests
            },
        },
        joinCodeRequestUsers: {
            forward: {
                on: "joinCodeRequests", // Each join code request
                has: "one", // has one
                label: "user", // user
                onDelete: "cascade",
            },
            reverse: {
                on: "$users", // Each user
                has: "one", // has one
                label: "joinCodeRequest", // join code request
            },
        },
        joinCodeDenied: {
            forward: {
                on: "joinCodes", // Each join code
                has: "many", // has many
                label: "denied", // denied users
            },
            reverse: {
                on: "$users", // Each user
                has: "many", // has many
                label: "deniedJoinCodes", // denied join codes
            },
        },
    },
    rooms: {
        homes: {
            presence: i.entity({}),
        },
    },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
