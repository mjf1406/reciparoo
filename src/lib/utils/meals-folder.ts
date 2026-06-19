/** @format */

import { id } from "@instantdb/react";
import { db } from "@/lib/db/db";

export const MEALS_FOLDER_NAME = "Meals";

export async function getOrCreateMealsFolderId(): Promise<string> {
    const { data } = await db.queryOnce({
        folders: {
            $: {
                where: {
                    name: MEALS_FOLDER_NAME,
                    "parentFolder.id": { $isNull: true },
                },
            },
        },
    });

    const existing = data?.folders?.[0];
    if (existing?.id) {
        return existing.id;
    }

    const folderId = id();
    const now = new Date();

    await db.transact(
        db.tx.folders[folderId].create({
            name: MEALS_FOLDER_NAME,
            description: "Combined meals built from multiple recipes",
            created: now,
            updated: now,
        })
    );

    return folderId;
}
