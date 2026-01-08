/** @format */

import { createFileRoute } from "@tanstack/react-router";
import { FeatureGrid } from "@/components/home/feature-grid";

export const Route = createFileRoute("/home/$homeId")({
    component: HomeDashboard,
});

function HomeDashboard() {
    const { homeId } = Route.useParams();

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                <h1 className="mb-8 text-3xl font-bold">Home Dashboard</h1>
                <FeatureGrid homeId={homeId} />
            </div>
        </div>
    );
}
