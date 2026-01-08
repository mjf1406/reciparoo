/** @format */

import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuthContext } from "@/components/auth/auth-provider";
import { LoginPage } from "@/components/auth/login-page";
import { NoHome } from "@/components/home/no-home";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage() {
    const { user, isLoading, homes, error } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && user?.id && homes.length > 0) {
            navigate({
                to: "/home/$homeId",
                params: { homeId: homes[0].id },
                replace: true,
            });
        }
    }, [isLoading, user?.id, homes, navigate]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-destructive">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    // Not authenticated - show login
    if (!user || !user.id) {
        return <LoginPage />;
    }

    // Authenticated but no homes - show create home prompt
    if (homes.length === 0) {
        return <NoHome />;
    }

    // Has homes - will redirect via useEffect
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="text-muted-foreground">Redirecting...</div>
        </div>
    );
}
