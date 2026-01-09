/** @format */

"use client";

import React, { createContext, useContext } from "react";
import { db } from "@/lib/db/db";
import type { InstaQLEntity } from "@instantdb/react";
import type { AppSchema } from "@/instant.schema";

type HomeWithRelations = InstaQLEntity<
    AppSchema,
    "homes",
    {
        owner: {};
        admins: {};
        homeMembers: {};
    }
>;

type HomeQueryResult = {
    homes: HomeWithRelations[];
};

interface AuthContextValue {
    user: {
        created_at: Date | null | string;
        email: string;
        id: string;
        imageURL: string | null;
        avatarURL: string | null;
        isGuest: boolean;
        refresh_token: string | null;
        updated_at: Date | null | string;
        type: string;
        firstName: string | null;
        lastName: string | null;
        plan: string;
    };
    isLoading: boolean;
    homes: HomeWithRelations[];
    error: { message: string } | null | undefined;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
}

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if app ID is configured
    const appId = import.meta.env.VITE_INSTANT_APP_ID;
    if (!appId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-4">
                <div className="bg-card border border-border rounded-lg p-4 max-w-md">
                    <h2 className="text-destructive font-bold mb-2">
                        Configuration Error
                    </h2>
                    <p className="text-foreground">
                        VITE_INSTANT_APP_ID is not set in your environment
                        variables.
                    </p>
                    <p className="text-muted-foreground text-sm mt-2">
                        Please set it in your .env file.
                    </p>
                </div>
            </div>
        );
    }

    const { user, isLoading: authLoading, error: authError } = db.useAuth();

    // Query user data only if authenticated
    const { data, isLoading: dataLoading } = db.useQuery(
        user?.id
            ? {
                  $users: {
                      $: { where: { id: user.id } },
                  },
              }
            : null
    );

    const userData = data?.$users?.[0];

    // Query homes only if authenticated
    const homeQuery = user?.id
        ? {
              homes: {
                  $: {
                      where: {
                          or: [
                              { "owner.id": user.id },
                              { "admins.id": user.id },
                              { "homeMembers.id": user.id },
                          ],
                      },
                  },
                  owner: {},
                  admins: {},
                  homeMembers: {},
              },
          }
        : null;

    const {
        data: homeData,
        isLoading: homeLoading,
        error: homeError,
    } = db.useQuery(homeQuery);

    const typedHomeData = (homeData as HomeQueryResult | undefined) ?? null;

    // Only show loading if:
    // 1. Auth is still loading, OR
    // 2. User exists and we're still loading user data or homes
    // If user is null, queries are null so they won't be loading
    const isLoading =
        authLoading || (user?.id ? dataLoading || homeLoading : false);

    const value: AuthContextValue = {
        user: {
            created_at: userData?.created || null,
            email: user?.email || "",
            id: user?.id || "",
            imageURL: user?.imageURL || null,
            avatarURL: userData?.avatarURL || null,
            isGuest: user?.isGuest || false,
            refresh_token: user?.refresh_token || null,
            updated_at: userData?.updated || null,
            type: userData?.type || "guest",
            firstName: userData?.firstName || null,
            lastName: userData?.lastName || null,
            plan: userData?.plan || "free",
        },
        isLoading,
        homes: typedHomeData?.homes || [],
        error: homeError || (authError ? { message: authError.message } : null),
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
