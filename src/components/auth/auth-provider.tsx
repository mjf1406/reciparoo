/** @format */

"use client";

import React, { createContext, useContext } from "react";
import { db } from "@/lib/db/db";
import { ADMIN_EMAIL } from "@/lib/constants";

interface AuthContextValue {
    user: {
        created_at: Date | null | string;
        email: string;
        id: string;
        imageURL: string | null;
        avatarURL: string | null;
        refresh_token: string | null;
        updated_at: Date | null | string;
        firstName: string | null;
        lastName: string | null;
        plan: string;
    };
    isLoading: boolean;
    isAuthenticated: boolean;
    canEdit: boolean;
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
    const email = user?.email || "";
    const canEdit = email === ADMIN_EMAIL;
    const isLoading = authLoading || (user?.id ? dataLoading : false);

    const value: AuthContextValue = {
        user: {
            created_at: userData?.created || null,
            email,
            id: user?.id || "",
            imageURL: user?.imageURL || null,
            avatarURL: userData?.avatarURL || null,
            refresh_token: user?.refresh_token || null,
            updated_at: userData?.updated || null,
            firstName: userData?.firstName || null,
            lastName: userData?.lastName || null,
            plan: userData?.plan || "free",
        },
        isLoading,
        isAuthenticated: !!user?.id,
        canEdit,
        error: authError ? { message: authError.message } : null,
    };

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
}
