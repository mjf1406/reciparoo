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
    // User is home member in user's table
    "isUserHomeMember",
    "auth.id in data.ref('home.id')",
    // User is still a home member in user's table
    "isStillUserHomeMember",
    "auth.id in newData.ref('homeMembers.id')",
    // User is a member of the home
    "isHomeMember",
    "auth.id in data.ref('homeMembers.id')",
    // User is still a member of the home
    "isStillHomeMember",
    "auth.id in newData.ref('homeMembers.id')",
    // User is an admin of the data (home admins)
    "isHomeAdmin",
    "auth.id in data.ref('admins.id')",
    // User is still an admin of the data
    "isStillHomeAdmin",
    "auth.id in newData.ref('admins.id')",
    // User is a viewer of the home
    "isHomeViewer",
    "auth.id in data.ref('viewers.id')",
    // User is still a viewer of the home
    "isStillHomeViewer",
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
    // User is owner of the home that the file belongs to
    "isFileHomeOwner",
    "auth.id in data.ref('home.owner.id')",
    // User is admin of the home that the file belongs to
    "isFileHomeAdmin",
    "auth.id in data.ref('home.admins.id')",
    // User is a member of the home that the file belongs to
    "isFileHomeMember",
    "auth.id in data.ref('home.homeMembers.id')",
    // User is a viewer of the home that the file belongs to
    "isFileHomeViewer",
    "auth.id in data.ref('home.viewers.id')",
    // User is owner of the home that the note's recipe belongs to
    "isNoteRecipeHomeOwner",
    "auth.id in data.ref('recipe.home.owner.id')",
    // User is admin of the home that the note's recipe belongs to
    "isNoteRecipeHomeAdmin",
    "auth.id in data.ref('recipe.home.admins.id')",
    // User is a member of the home that the note's recipe belongs to
    "isNoteRecipeHomeMember",
    "auth.id in data.ref('recipe.home.homeMembers.id')",
    // User is a viewer of the home that the note's recipe belongs to
    "isNoteRecipeHomeViewer",
    "auth.id in data.ref('recipe.home.viewers.id')",
    // User is owner of the home that the folder belongs to
    "isFolderHomeOwner",
    "auth.id in data.ref('home.owner.id')",
    // User is admin of the home that the folder belongs to
    "isFolderHomeAdmin",
    "auth.id in data.ref('home.admins.id')",
    // User is a member of the home that the folder belongs to
    "isFolderHomeMember",
    "auth.id in data.ref('home.homeMembers.id')",
    // User is a viewer of the home that the folder belongs to
    "isFolderHomeViewer",
    "auth.id in data.ref('home.viewers.id')",
    // User is owner of the home that the meal plan belongs to
    "isMealPlanHomeOwner",
    "auth.id in data.ref('home.owner.id')",
    // User is admin of the home that the meal plan belongs to
    "isMealPlanHomeAdmin",
    "auth.id in data.ref('home.admins.id')",
    // User is a member of the home that the meal plan belongs to
    "isMealPlanHomeMember",
    "auth.id in data.ref('home.homeMembers.id')",
    // User is a viewer of the home that the meal plan belongs to
    "isMealPlanHomeViewer",
    "auth.id in data.ref('home.viewers.id')",
    // User is owner of the home that the meal slot's meal plan belongs to
    "isMealSlotHomeOwner",
    "auth.id in data.ref('mealPlan.home.owner.id')",
    // User is admin of the home that the meal slot's meal plan belongs to
    "isMealSlotHomeAdmin",
    "auth.id in data.ref('mealPlan.home.admins.id')",
    // User is a member of the home that the meal slot's meal plan belongs to
    "isMealSlotHomeMember",
    "auth.id in data.ref('mealPlan.home.homeMembers.id')",
    // User is a viewer of the home that the meal slot's meal plan belongs to
    "isMealSlotHomeViewer",
    "auth.id in data.ref('mealPlan.home.viewers.id')",
    // User is owner of the home that the meal slot recipe's meal slot's meal plan belongs to
    "isMealSlotRecipeHomeOwner",
    "auth.id in data.ref('mealSlot.mealPlan.home.owner.id')",
    // User is admin of the home that the meal slot recipe's meal slot's meal plan belongs to
    "isMealSlotRecipeHomeAdmin",
    "auth.id in data.ref('mealSlot.mealPlan.home.admins.id')",
    // User is a member of the home that the meal slot recipe's meal slot's meal plan belongs to
    "isMealSlotRecipeHomeMember",
    "auth.id in data.ref('mealSlot.mealPlan.home.homeMembers.id')",
    // User is a viewer of the home that the meal slot recipe's meal slot's meal plan belongs to
    "isMealSlotRecipeHomeViewer",
    "auth.id in data.ref('mealSlot.mealPlan.home.viewers.id')",
];
// ============================================================
//                  USER-HOME RELATIONSHIPS
// ============================================================
const userBind = [
    // User being viewed is a member of a home where auth user is owner/admin/member/viewer
    "isMemberInMyHome",
    "auth.id in data.ref('memberHomes.owner.id') || auth.id in data.ref('memberHomes.admins.id') || auth.id in data.ref('memberHomes.homeMembers.id') || auth.id in data.ref('memberHomes.viewers.id')",
    // User being viewed is an admin of a home where auth user is owner/admin/member/viewer
    "isAdminInMyHome",
    "auth.id in data.ref('adminHomes.owner.id') || auth.id in data.ref('adminHomes.admins.id') || auth.id in data.ref('adminHomes.homeMembers.id') || auth.id in data.ref('adminHomes.viewers.id')",
    // User being viewed is a viewer of a home where auth user is owner/admin/member/viewer
    "isViewerInMyHome",
    "auth.id in data.ref('viewerHomes.owner.id') || auth.id in data.ref('viewerHomes.admins.id') || auth.id in data.ref('viewerHomes.homeMembers.id') || auth.id in data.ref('viewerHomes.viewers.id')",
    // User being viewed is an owner of a home where auth user is owner/admin/member/viewer
    "isOwnerInMyHome",
    "auth.id in data.ref('homes.owner.id') || auth.id in data.ref('homes.admins.id') || auth.id in data.ref('homes.homeMembers.id') || auth.id in data.ref('homes.viewers.id')",
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
            view: "isAuthenticated && (auth.id in data.ref('owner.id') || isFileHomeOwner || isFileHomeAdmin || isFileHomeMember || isFileHomeViewer)",
            update: "isAuthenticated && (data.ref('owner.id') == [] || (auth.id in data.ref('owner.id') && auth.id in newData.ref('owner.id')))", // Allow update if: no owner yet (new file) OR you are the owner and remain the owner
            delete: "isAuthenticated && auth.id in data.ref('owner.id')",
        },
        bind: dataBind,
    },
    $users: {
        allow: {
            view: "isAuthenticated && (auth.id == data.id || isMemberInMyHome || isAdminInMyHome || isViewerInMyHome || isOwnerInMyHome)",
            create: "false",
            update: "isAuthenticated && isOwner && isStillOwner",
            delete: "false",
        },
        bind: [...dataBind, ...userBind],
    },
    homes: {
        allow: {
            create: "isAuthenticated",
            view: "isAuthenticated && (isOwner || isHomeAdmin || isHomeMember || isHomeViewer)",
            update: "isAuthenticated && (isOwner || isHomeAdmin)",
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
            create: "isAuthenticated && (isRecipeHomeOwner || isRecipeHomeAdmin || isRecipeHomeMember || isRecipeHomeViewer)",
            view: "true",
            update: "isAuthenticated && (isRecipeHomeOwner || isRecipeHomeAdmin || isRecipeHomeMember)",
            delete: "isAuthenticated && (isRecipeHomeOwner || isRecipeHomeAdmin || isRecipeHomeMember)",
        },
        bind: dataBind,
    },
    notes: {
        allow: {
            create: "isAuthenticated && (isNoteRecipeHomeOwner || isNoteRecipeHomeAdmin || isNoteRecipeHomeMember || isNoteRecipeHomeViewer)",
            view: "isAuthenticated && (isNoteRecipeHomeOwner || isNoteRecipeHomeAdmin || isNoteRecipeHomeMember || isNoteRecipeHomeViewer)",
            update: "isAuthenticated && (isNoteRecipeHomeOwner || isNoteRecipeHomeAdmin || isNoteRecipeHomeMember || isNoteRecipeHomeViewer)",
            delete: "isAuthenticated && (isNoteRecipeHomeOwner || isNoteRecipeHomeAdmin || isNoteRecipeHomeMember || isNoteRecipeHomeViewer)",
        },
        bind: dataBind,
    },
    folders: {
        allow: {
            create: "isAuthenticated && (isFolderHomeOwner || isFolderHomeAdmin || isFolderHomeMember || isFolderHomeViewer)",
            view: "isAuthenticated && (isFolderHomeOwner || isFolderHomeAdmin || isFolderHomeMember || isFolderHomeViewer)",
            update: "isAuthenticated && (isFolderHomeOwner || isFolderHomeAdmin || isFolderHomeMember)",
            delete: "isAuthenticated && (isFolderHomeOwner || isFolderHomeAdmin || isFolderHomeMember)",
        },
        bind: dataBind,
    },
    mealPlans: {
        allow: {
            create: "isAuthenticated && (isMealPlanHomeOwner || isMealPlanHomeAdmin || isMealPlanHomeMember)",
            view: "isAuthenticated && (isMealPlanHomeOwner || isMealPlanHomeAdmin || isMealPlanHomeMember || isMealPlanHomeViewer)",
            update: "isAuthenticated && (isMealPlanHomeOwner || isMealPlanHomeAdmin || isMealPlanHomeMember)",
            delete: "isAuthenticated && (isMealPlanHomeOwner || isMealPlanHomeAdmin)",
        },
        bind: dataBind,
    },
    mealSlots: {
        allow: {
            create: "isAuthenticated && (isMealSlotHomeOwner || isMealSlotHomeAdmin || isMealSlotHomeMember)",
            view: "isAuthenticated && (isMealSlotHomeOwner || isMealSlotHomeAdmin || isMealSlotHomeMember || isMealSlotHomeViewer)",
            update: "isAuthenticated && (isMealSlotHomeOwner || isMealSlotHomeAdmin || isMealSlotHomeMember)",
            delete: "isAuthenticated && (isMealSlotHomeOwner || isMealSlotHomeAdmin || isMealSlotHomeMember)",
        },
        bind: dataBind,
    },
    mealSlotRecipes: {
        allow: {
            create: "isAuthenticated && (isMealSlotRecipeHomeOwner || isMealSlotRecipeHomeAdmin || isMealSlotRecipeHomeMember)",
            view: "isAuthenticated && (isMealSlotRecipeHomeOwner || isMealSlotRecipeHomeAdmin || isMealSlotRecipeHomeMember || isMealSlotRecipeHomeViewer)",
            update: "isAuthenticated && (isMealSlotRecipeHomeOwner || isMealSlotRecipeHomeAdmin || isMealSlotRecipeHomeMember)",
            delete: "isAuthenticated && (isMealSlotRecipeHomeOwner || isMealSlotRecipeHomeAdmin || isMealSlotRecipeHomeMember)",
        },
        bind: dataBind,
    },
} satisfies InstantRules;

export default rules;
