/** @format */

import { useAuthContext } from "@/components/auth/auth-provider";
import { db } from "@/lib/db/db";

export default function useHomeById(homeId: string) {
    const { user, isLoading: authLoading } = useAuthContext();

    // Only query when user is available
    const query = user?.id
        ? {
              homes: {
                  $: {
                      where: {
                          and: [
                              { id: homeId },
                              {
                                  or: [
                                      { "owner.id": user.id },
                                      { "admins.id": user.id },
                                      { "homeMembers.id": user.id },
                                      { "viewers.id": user.id },
                                  ],
                              },
                          ],
                      },
                  },
                  //   id: {},
                  //   name: {},
                  //   description: {},
                  //   icon: {},
                  //   created: {},
                  //   updated: {},
                  owner: {},
                  admins: {},
                  homeMembers: {},
                  viewers: {},
              },
          }
        : null;

    const { data, isLoading: queryLoading, error } = db.useQuery(query);

    const homes =
        query && data ? (data as { homes?: unknown[] }).homes : undefined;
    const home = homes?.[0] ?? null;
    const isLoading = authLoading || queryLoading;

    return {
        home,
        isLoading,
        error,
    };
}
