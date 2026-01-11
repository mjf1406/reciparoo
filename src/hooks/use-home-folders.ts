/** @format */

import { useAuthContext } from "@/components/auth/auth-provider";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type FolderWithRelations = InstaQLEntity<
    AppSchema,
    "folders",
    {
        home: {
            owner: {};
            admins: {};
            homeMembers: {};
            viewers: {};
        };
        parentFolder: {};
        subfolders: {};
        recipes: {};
    }
>;

export default function useHomeFolders(homeId: string, parentFolderId?: string | null) {
    const { user, isLoading: authLoading } = useAuthContext();

    // Only query when user is available
    // Note: recipes: {} fetches all recipe fields including imageURL
    const query = user?.id
        ? {
              folders: {
                  $: {
                      where: {
                          "home.id": homeId,
                          ...(parentFolderId === null || parentFolderId === undefined
                              ? { "parentFolder.id": { $isNull: true } }
                              : { "parentFolder.id": parentFolderId }),
                      },
                  },
                  home: {
                      owner: {},
                      admins: {},
                      homeMembers: {},
                      viewers: {},
                  },
                  parentFolder: {},
                  subfolders: {},
                  recipes: {}, // Includes all recipe fields (id, name, imageURL, etc.)
              },
          }
        : null;

    const { data, isLoading: queryLoading, error } = db.useQuery(query);

    const folders =
        query && data
            ? ((data as { folders?: unknown[] }).folders || []) as FolderWithRelations[]
            : [];
    const isLoading = authLoading || queryLoading;

    return {
        folders,
        isLoading,
        error,
    };
}
