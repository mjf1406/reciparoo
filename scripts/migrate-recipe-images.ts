/**
 * One-time migration: link orphaned $files to recipes via imageFile / nutritionFile.
 * Run: npx tsx scripts/migrate-recipe-images.ts
 */

import { init } from "@instantdb/admin";
import { readFileSync } from "fs";
import { resolve } from "path";
import schema from "../src/instant.schema";

function loadEnv() {
    const envPath = resolve(process.cwd(), ".env");
    const env: Record<string, string> = {};
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
        if (!line.includes("=")) continue;
        const i = line.indexOf("=");
        env[line.slice(0, i)] = line.slice(i + 1);
    }
    return env;
}

const env = loadEnv();
const appId = env.VITE_INSTANT_APP_ID;
const adminToken = env.INSTANT_APP_ADMIN_TOKEN;

if (!appId || !adminToken) {
    console.error("Missing VITE_INSTANT_APP_ID or INSTANT_APP_ADMIN_TOKEN in .env");
    process.exit(1);
}

const db = init({ appId, adminToken, schema, useDateObjects: true });

type FileRecord = { id: string; path: string };

function parseRecipeIdFromPath(path: string): {
    recipeId: string;
    kind: "image" | "nutrition";
    sortKey: string;
} | null {
    const parts = path.split("/");
    if (parts[0] !== "recipes" || !parts[1]) return null;

    const recipeId = parts[1];
    const rest = parts.slice(2).join("/");

    if (parts[2] === "nutrition") {
        return { recipeId, kind: "nutrition", sortKey: parts.slice(3).join("/") };
    }
    if (parts[2]?.startsWith("nutrition-label")) {
        return { recipeId, kind: "nutrition", sortKey: rest };
    }
    if (parts.length >= 3) {
        return { recipeId, kind: "image", sortKey: rest };
    }
    return null;
}

function isNutritionPath(path: string): boolean {
    const parsed = parseRecipeIdFromPath(path);
    return parsed?.kind === "nutrition";
}

function pickNewestFile(files: FileRecord[]): FileRecord {
    return files.reduce((best, file) => {
        const bestKey = parseRecipeIdFromPath(best.path)?.sortKey ?? "";
        const fileKey = parseRecipeIdFromPath(file.path)?.sortKey ?? "";
        return fileKey > bestKey ? file : best;
    });
}

async function migrate() {
    console.log("Fetching recipes and recipe files...");

    const data = await db.query({
        recipes: {
            imageFile: {},
            nutritionFile: {},
        },
        $files: {
            $: {
                where: {
                    path: { $like: "recipes/%" },
                },
            },
        },
    });

    const recipes = data.recipes ?? [];
    const files = (data.$files ?? []) as FileRecord[];

    const imageFilesByRecipe = new Map<string, FileRecord[]>();
    const nutritionFilesByRecipe = new Map<string, FileRecord[]>();

    for (const file of files) {
        const parsed = parseRecipeIdFromPath(file.path);
        if (!parsed) continue;

        const map =
            parsed.kind === "nutrition"
                ? nutritionFilesByRecipe
                : imageFilesByRecipe;
        const list = map.get(parsed.recipeId) ?? [];
        list.push(file);
        map.set(parsed.recipeId, list);
    }

    const txs: ReturnType<typeof db.tx.recipes[string]["link"]>[] = [];
    let imageLinks = 0;
    let nutritionLinks = 0;
    let correctedLinks = 0;
    let clearedUrls = 0;
    const missingImage: string[] = [];
    const missingNutrition: string[] = [];

    for (const recipe of recipes) {
        const recipeId = recipe.id;
        let hasImageLink = !!recipe.imageFile;
        let hasNutritionLink = !!recipe.nutritionFile;

        // Fix mis-linked nutrition files attached as imageFile
        if (
            recipe.imageFile &&
            isNutritionPath(recipe.imageFile.path)
        ) {
            const fileId = recipe.imageFile.id;
            txs.push(db.tx.recipes[recipeId].unlink({ imageFile: fileId }));
            if (!hasNutritionLink) {
                txs.push(
                    db.tx.recipes[recipeId].link({ nutritionFile: fileId })
                );
                nutritionLinks++;
                hasNutritionLink = true;
                console.log(
                    `  Correct nutrition link: ${recipe.name} <- ${recipe.imageFile.path}`
                );
            }
            hasImageLink = false;
            correctedLinks++;
        }

        const candidateImages = imageFilesByRecipe.get(recipeId) ?? [];
        const candidateNutrition = nutritionFilesByRecipe.get(recipeId) ?? [];

        let shouldClearImageUrl = false;
        let shouldClearNutritionUrl = false;

        if (!hasImageLink && candidateImages.length > 0) {
            const file = pickNewestFile(candidateImages);
            txs.push(db.tx.recipes[recipeId].link({ imageFile: file.id }));
            imageLinks++;
            shouldClearImageUrl = true;
            console.log(`  Link image: ${recipe.name} <- ${file.path}`);
        } else if (!hasImageLink && recipe.imageURL) {
            missingImage.push(`${recipe.name} (${recipeId})`);
        }

        if (!hasNutritionLink && candidateNutrition.length > 0) {
            const file = pickNewestFile(candidateNutrition);
            txs.push(db.tx.recipes[recipeId].link({ nutritionFile: file.id }));
            nutritionLinks++;
            shouldClearNutritionUrl = true;
            console.log(`  Link nutrition: ${recipe.name} <- ${file.path}`);
        } else if (!hasNutritionLink && recipe.nutritionLabelImageURL) {
            missingNutrition.push(`${recipe.name} (${recipeId})`);
        }

        if (shouldClearImageUrl || shouldClearNutritionUrl) {
            txs.push(
                db.tx.recipes[recipeId].update({
                    ...(shouldClearImageUrl ? { imageURL: null } : {}),
                    ...(shouldClearNutritionUrl
                        ? { nutritionLabelImageURL: null }
                        : {}),
                })
            );
            clearedUrls++;
        }
    }

    if (txs.length === 0) {
        console.log("No migrations needed.");
    } else {
        const batchSize = 50;
        for (let i = 0; i < txs.length; i += batchSize) {
            await db.transact(txs.slice(i, i + batchSize));
        }
        console.log(`Applied ${txs.length} transaction(s).`);
    }

    console.log("\n--- Migration summary ---");
    console.log(`Recipes processed: ${recipes.length}`);
    console.log(`Image files linked: ${imageLinks}`);
    console.log(`Nutrition files linked: ${nutritionLinks}`);
    console.log(`Mis-linked files corrected: ${correctedLinks}`);
    console.log(`Recipes with stale URLs cleared: ${clearedUrls}`);

    if (missingImage.length > 0) {
        console.log(`\nRecipes with imageURL but no matching $files (${missingImage.length}):`);
        for (const entry of missingImage) console.log(`  - ${entry}`);
    }

    if (missingNutrition.length > 0) {
        console.log(
            `\nRecipes with nutritionLabelImageURL but no matching $files (${missingNutrition.length}):`
        );
        for (const entry of missingNutrition) console.log(`  - ${entry}`);
    }
}

migrate().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
