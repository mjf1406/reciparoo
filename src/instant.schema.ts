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
            icon: i.string().optional(),
            created: i.date(),
            updated: i.date(),
        }),
    },
    links: {
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
    },
    rooms: {
        todos: {
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
