/** @format */

import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

export type FolderWithRelations = InstaQLEntity<
    AppSchema,
    "folders",
    {
        parentFolder: {};
        subfolders: {};
        recipes: {
            imageFile: {};
        };
    }
>;

export default function useFolders(parentFolderId?: string | null) {
    const query = {
        folders: {
            $: {
                where: {
                    ...(parentFolderId === null || parentFolderId === undefined
                        ? { "parentFolder.id": { $isNull: true } }
                        : { "parentFolder.id": parentFolderId }),
                },
            },
            parentFolder: {},
            subfolders: {},
            recipes: {
                imageFile: {},
            },
        },
    };

    const { data, isLoading, error } = db.useQuery(query);

    const folders = (data?.folders || []) as unknown as FolderWithRelations[];

    return {
        folders,
        isLoading,
        error,
    };
}
