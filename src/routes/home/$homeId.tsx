/** @format */

import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid } from "@/components/home/feature-grid";
import { Navbar } from "@/components/layout/navbar";
import useHomeById from "@/hooks/use-home-by-id";
import { HomeIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/home/$homeId")({
    component: HomeDashboard,
});

function HomeDashboard() {
    const { homeId } = Route.useParams();
    const { home, isLoading, error } = useHomeById(homeId!);

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

    return (
        <div className="min-h-screen bg-background">
            <Navbar homeId={homeId} />
            <main className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl! font-bold flex items-center">
                    <HomeIcon className="w-12 h-12 mr-2 inline-block text-primary" />{" "}
                    {(home as { name: string } | null)?.name}
                </h1>
                <FeatureGrid homeId={homeId} />
            </main>
        </div>
    );
}
