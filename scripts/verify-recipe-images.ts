/**
 * Verify recipe image links after migration.
 * Run: npx tsx scripts/verify-recipe-images.ts
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
const db = init({
    appId: env.VITE_INSTANT_APP_ID,
    adminToken: env.INSTANT_APP_ADMIN_TOKEN,
    schema,
});

const data = await db.query({
    recipes: {
        imageFile: {},
        nutritionFile: {},
    },
});

let withImage = 0;
let withNutrition = 0;
let missing = 0;

for (const recipe of data.recipes ?? []) {
    const imageOk = !!recipe.imageFile?.url;
    const nutritionOk = !!recipe.nutritionFile?.url;

    if (imageOk) withImage++;
    if (nutritionOk) withNutrition++;
    if (!imageOk && !recipe.imageURL) missing++;

    console.log(
        `${recipe.name}: image=${imageOk ? "ok" : recipe.imageURL ? "stale-url-only" : "none"}, nutrition=${nutritionOk ? "ok" : recipe.nutritionLabelImageURL ? "stale-url-only" : "none"}`
    );
}

console.log("\n--- Verification ---");
console.log(`Recipes with linked image URL: ${withImage}`);
console.log(`Recipes with linked nutrition URL: ${withNutrition}`);
console.log(`Recipes without any image source: ${missing}`);
