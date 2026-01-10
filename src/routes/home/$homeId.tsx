/** @format */

import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { FeatureGrid } from "@/components/home/feature-grid";
import { Navbar } from "@/components/layout/navbar";
import useHomeById from "@/hooks/use-home-by-id";
import { HomeIcon, Loader2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { JoinCodesList } from "@/components/home/join-codes-list";
import { JoinRequestsList } from "@/components/home/join-requests-list";
import { ManageMembersCard } from "@/components/home/manage-members-card";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";

export const Route = createFileRoute("/home/$homeId")({
    component: HomeDashboard,
});

function HomeDashboard() {
    const { homeId } = Route.useParams();
    const { home, isLoading, error } = useHomeById(homeId!);
    const { user } = useAuthContext();
    const location = useLocation();

    // Check if user is owner or admin
    const isOwnerOrAdmin =
        home &&
        user?.id &&
        ((home as { owner?: { id: string } }).owner?.id === user.id ||
            (home as { admins?: Array<{ id: string }> }).admins?.some(
                (admin) => admin.id === user.id
            ));

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                {" "}
                <Loader2 className="w-4 h-4 ml-2 animate-spin" /> Loading...
            </div>
        );
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    if (!home) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="text-center text-destructive">
                    <p>
                        Home with ID{" "}
                        <span className="inline font-bold italic text-foreground">
                            {homeId}
                        </span>{" "}
                        not found.
                    </p>
                    <br />
                    <p>
                        It either does not exist or you are not authorized to
                        access it.
                    </p>
                </div>
            </div>
        );
    }

    // Check if we're on the exact route (no child route) by comparing pathname
    // The pathname should be exactly /home/{homeId} with no additional segments
    const expectedPath = `/home/${homeId}`;
    const isExactRoute = location.pathname === expectedPath;
    
    const userRole = getUserRoleInHome(home, user?.id);
    
    return (
        <div className="min-h-screen bg-background">
            <Navbar homeId={homeId} />
            {isExactRoute ? (
                <main className="container mx-auto px-4 py-8">
                    <Breadcrumb
                        items={[
                            { label: "Home", to: "/" },
                            { label: (home as { name: string } | null)?.name || "Home" },
                        ]}
                        className="mb-6"
                        role={userRole}
                    />
                    <h1 className="mb-8 text-3xl! font-bold flex items-center">
                        <HomeIcon className="w-12 h-12 mr-2 inline-block text-primary" />{" "}
                        {(home as { name: string } | null)?.name}
                    </h1>
                    <FeatureGrid homeId={homeId} />
                    {isOwnerOrAdmin && (
                        <div className="mt-8 space-y-6">
                            <ManageMembersCard homeId={homeId} />
                            <JoinCodesList homeId={homeId} />
                            <JoinRequestsList homeId={homeId} />
                        </div>
                    )}
                </main>
            ) : (
                <Outlet />
            )}
        </div>
    );
}
