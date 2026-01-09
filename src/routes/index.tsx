/** @format */

import { createFileRoute } from "@tanstack/react-router";
import { useAuthContext } from "@/components/auth/auth-provider";
import { LoginPage } from "@/components/auth/login-page";
import { NoHome } from "@/components/home/no-home";
import { HomesGrid } from "@/components/home/homes-grid";
import { Navbar } from "@/components/layout/navbar";

export const Route = createFileRoute("/")({
    component: HomePage,
});

function HomePage() {
    const { user, isLoading, homes, error } = useAuthContext();

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
                <div className="text-destructive">Error: {error.message}</div>
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

    // Has homes - show grid of homes
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <HomesGrid homes={homes} />
            </main>
        </div>
    );
}
