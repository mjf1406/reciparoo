/** @format */

// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/core";

const dataBind = [
    // Authenticated user
    "isAuthenticated",
    "auth.id != null",
    // User is a guest
    "isGuest",
    "auth.isGuest == true",
    // User is not a guest
    "isNotGuest",
    "auth.isGuest == false",
    // User is the owner of the data
    "isOwner",
    "auth.id in data.ref('owner.id') || auth.id == data.id",
    // User is still the owner of the data
    "isStillOwner",
    "auth.id in newData.ref('owner.id') || auth.id == newData.id",
    // User is a premium user
    "isPremium",
    "auth.ref('$user.profile.plan').exists(p, p in ['basic', 'plus', 'pro'])",
    // User is a member of the home
    "isHomeMember",
    "auth.id in data.ref('homeMembers.id')",
    // User is still a member of the home
    "isStillHomeMember",
    "auth.id in newData.ref('homeMembers.id')",
    // User is an admin of the data (home admins)
    "isAdmin",
    "auth.id in data.ref('admins.id')",
    // User is still an admin of the data
    "isStillAdmin",
    "auth.id in newData.ref('admins.id')",
];

const rules = {
    attrs: {
        allow: {
            $default: "false",
        },
    },
    $files: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && isOwner",
            update: "isAuthenticated && (data.ref('owner.id') == [] || (isOwner && isStillOwner))", // Allow update if: no owner yet (new file) OR you are the owner
            delete: "isAuthenticated && isOwner",
        },
        bind: dataBind,
    },
    $users: {
        allow: {
            view: "isAuthenticated",
            create: "false",
            // Allow users to update their own records, OR allow class/org admins to update users
            // who are members of classes/organizations where the admin has permissions
            update: "isAuthenticated && ((isOwner && isStillOwner) || (auth.id in data.ref('studentClasses.classAdmins.id') || auth.id in data.ref('parentClasses.classAdmins.id') || auth.id in data.ref('teacherClasses.classAdmins.id') || auth.id in data.ref('studentOrganizations.admins.id') || auth.id in data.ref('parentOrganizations.admins.id') || auth.id in data.ref('teacherOrganizations.admins.id')))",
            delete: "false",
        },
        bind: dataBind,
    },
    homes: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isOwner || isAdmin || isHomeMember)",
            update: "isAuthenticated && (isOwner || isAdmin)",
            delete: "isAuthenticated && isOwner",
        },
        bind: dataBind,
    },
} satisfies InstantRules;

export default rules;
