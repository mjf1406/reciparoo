/** @format */

// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/core";

const _schema = i.schema({
    entities: {
        $files: i.entity({
            path: i.string().unique().indexed(),
            url: i.string(),
            created: i.date().indexed().optional(),
            updated: i.date().indexed().optional(),
        }),
        $users: i.entity({
            email: i.string().unique().indexed().optional(),
            imageURL: i.string().optional(),
            type: i.string().optional(),
            avatarURL: i.string().optional(),
            plan: i.string().optional(),
            firstName: i.string().optional(),
            lastName: i.string().optional(),
            created: i.date().optional(),
            updated: i.date().optional(),
            lastLogon: i.date().optional(),
        }),
        recipes: i.entity({
            name: i.string().indexed(),
            imageURL: i.string().optional(),
            nutritionLabelImageURL: i.string().optional(),
            description: i.string().optional(),
            diet: i.string().optional(),
            prepTime: i.number().optional(),
            cookTime: i.number().optional(),
            yield: i.number().optional(),
            servingSize: i.number().optional(),
            servingUnit: i.string().optional(),
            ingredients: i.string().optional(),
            equipment: i.string().optional(),
            procedure: i.string().optional(),
            source: i.string().optional(),
            videoURL: i.string().optional(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
        notes: i.entity({
            content: i.string(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
        folders: i.entity({
            name: i.string().indexed(),
            description: i.string().optional(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
        mealPlans: i.entity({
            name: i.string().indexed(),
            duration: i.number().indexed(),
            startDayOfWeek: i.number().indexed(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
        mealSlots: i.entity({
            name: i.string().indexed(),
            type: i.string().indexed(),
            time: i.string().indexed(),
            dayBitmask: i.number().indexed(),
            created: i.date().indexed(),
            updated: i.date().indexed(),
        }),
        mealSlotRecipes: i.entity({
            order: i.number().optional(),
            created: i.date().indexed(),
        }),
    },
    links: {
        userFiles: {
            forward: {
                on: "$files",
                has: "one",
                label: "owner",
                onDelete: "cascade",
            },
            reverse: {
                on: "$users",
                has: "many",
                label: "files",
            },
        },
        recipeNotes: {
            forward: {
                on: "notes",
                has: "one",
                label: "recipe",
                onDelete: "cascade",
            },
            reverse: {
                on: "recipes",
                has: "many",
                label: "notes",
            },
        },
        recipeFolder: {
            forward: {
                on: "recipes",
                has: "one",
                label: "folder",
                onDelete: "cascade",
            },
            reverse: {
                on: "folders",
                has: "many",
                label: "recipes",
            },
        },
        recipeImageFile: {
            forward: {
                on: "recipes",
                has: "one",
                label: "imageFile",
            },
            reverse: {
                on: "$files",
                has: "one",
                label: "imageForRecipe",
            },
        },
        recipeNutritionFile: {
            forward: {
                on: "recipes",
                has: "one",
                label: "nutritionFile",
            },
            reverse: {
                on: "$files",
                has: "one",
                label: "nutritionForRecipe",
            },
        },
        folderParent: {
            forward: {
                on: "folders",
                has: "one",
                label: "parentFolder",
                onDelete: "cascade",
            },
            reverse: {
                on: "folders",
                has: "many",
                label: "subfolders",
            },
        },
        mealPlanSlots: {
            forward: {
                on: "mealSlots",
                has: "one",
                label: "mealPlan",
                onDelete: "cascade",
            },
            reverse: {
                on: "mealPlans",
                has: "many",
                label: "mealSlots",
            },
        },
        mealSlotRecipeSlot: {
            forward: {
                on: "mealSlotRecipes",
                has: "one",
                label: "mealSlot",
                onDelete: "cascade",
            },
            reverse: {
                on: "mealSlots",
                has: "many",
                label: "mealSlotRecipes",
            },
        },
        mealSlotRecipeRecipe: {
            forward: {
                on: "mealSlotRecipes",
                has: "one",
                label: "recipe",
                onDelete: "cascade",
            },
            reverse: {
                on: "recipes",
                has: "many",
                label: "mealSlotRecipes",
            },
        },
    },
    rooms: {},
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
