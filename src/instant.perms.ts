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
    // User is a viewer of the home
    "isViewer",
    "auth.id in data.ref('viewers.id')",
    // User is still a viewer of the home
    "isStillViewer",
    "auth.id in newData.ref('viewers.id')",
    // User is owner of the home that the join code belongs to
    "isJoinCodeHomeOwner",
    "auth.id in data.ref('home.owner.id')",
    // User is admin of the home that the join code belongs to
    "isJoinCodeHomeAdmin",
    "auth.id in data.ref('home.admins.id')",
    // User is owner of the home that the join code request's join code belongs to
    "isJoinCodeRequestHomeOwner",
    "auth.id in data.ref('joinCode.home.owner.id')",
    // User is admin of the home that the join code request's join code belongs to
    "isJoinCodeRequestHomeAdmin",
    "auth.id in data.ref('joinCode.home.admins.id')",
    // User created the join code request
    "isJoinCodeRequestCreator",
    "auth.id in data.ref('user.id')",
    // User is owner of the home that the recipe belongs to
    "isRecipeHomeOwner",
    "auth.id in data.ref('home.owner.id')",
    // User is admin of the home that the recipe belongs to
    "isRecipeHomeAdmin",
    "auth.id in data.ref('home.admins.id')",
    // User is a member of the home that the recipe belongs to
    "isRecipeHomeMember",
    "auth.id in data.ref('home.homeMembers.id')",
    // User is a viewer of the home that the recipe belongs to
    "isRecipeHomeViewer",
    "auth.id in data.ref('home.viewers.id')",
    // Note: File home permissions would require querying the home separately
    // For now, files are viewable by owner or if they belong to a home the user is part of
    // This is simplified - in practice you might want to query the home to check membership
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
            view: "isAuthenticated && data.owner == auth.id", // Files are viewable by owner only (home-based access can be added later if needed)
            update: "isAuthenticated && (data.owner == null || data.owner == '' || data.owner == auth.id)", // Allow update if: no owner yet (new file) OR you are the owner
            delete: "isAuthenticated && data.owner == auth.id",
        },
        bind: dataBind,
    },
    $users: {
        allow: {
            view: "isAuthenticated",
            create: "false",
            update: "isAuthenticated && isOwner && isStillOwner",
            delete: "false",
        },
        bind: dataBind,
    },
    homes: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isOwner || isAdmin || isHomeMember || isViewer)",
            update: "isAuthenticated && (isOwner || isAdmin)",
            delete: "isAuthenticated && isOwner",
        },
        bind: dataBind,
    },
    joinCodes: {
        allow: {
            create: "isAuthenticated && (isJoinCodeHomeOwner || isJoinCodeHomeAdmin)",
            view: "isAuthenticated",
            update: "isAuthenticated && (isJoinCodeHomeOwner || isJoinCodeHomeAdmin)",
            delete: "isAuthenticated && (isJoinCodeHomeOwner || isJoinCodeHomeAdmin)",
        },
        bind: dataBind,
    },
    joinCodeRequests: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isJoinCodeRequestCreator || isJoinCodeRequestHomeOwner || isJoinCodeRequestHomeAdmin)",
            update: "isAuthenticated && (isJoinCodeRequestHomeOwner || isJoinCodeRequestHomeAdmin)",
            delete: "isAuthenticated && (isJoinCodeRequestHomeOwner || isJoinCodeRequestHomeAdmin)",
        },
        bind: dataBind,
    },
    recipes: {
        allow: {
            create: "isAuthenticated && (isRecipeHomeOwner || isRecipeHomeAdmin)",
            view: "isAuthenticated && (isRecipeHomeOwner || isRecipeHomeAdmin || isRecipeHomeMember || isRecipeHomeViewer)",
            update: "isAuthenticated && (isRecipeHomeOwner || isRecipeHomeAdmin)",
            delete: "isAuthenticated && (isRecipeHomeOwner || isRecipeHomeAdmin)",
        },
        bind: dataBind,
    },
} satisfies InstantRules;

export default rules;
