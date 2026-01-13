/** @format */

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import useHomeById from "@/hooks/use-home-by-id";
import useMealPlans from "@/hooks/use-meal-plans";
import { Calendar, Loader2, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { MealPlansGrid } from "@/components/meal-plans/meal-plans-grid";
import { CreateMealPlanDialog } from "@/components/meal-plans/create-meal-plan-dialog";

export const Route = createFileRoute("/home/$homeId/calendar")({
    component: CalendarPage,
});

function CalendarPage() {
    const { homeId } = Route.useParams();
    const { home, isLoading: homeLoading, error: homeError } = useHomeById(homeId!);
    const { mealPlans, isLoading: mealPlansLoading, error: mealPlansError } = useMealPlans(homeId!);
    const { user } = useAuthContext();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const isLoading = homeLoading || mealPlansLoading;
    const error = homeError || mealPlansError;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
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

    const homeName = (home as { name: string } | null)?.name || "Home";
    const userRole = getUserRoleInHome(home, user?.id);
    const canCreateMealPlan = userRole && userRole !== "viewer";

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: homeName, to: `/home/${homeId}` },
                    { label: "Meal Plans" },
                ]}
                className="mb-6"
                role={userRole}
            />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-2">
                    <Calendar className="h-8 w-8 text-primary" />
                    Meal Plans
                </h1>
                {canCreateMealPlan && mealPlans.length > 0 && (
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Meal Plan
                    </Button>
                )}
            </div>

            {/* Meal Plans Grid */}
            <MealPlansGrid
                mealPlans={mealPlans}
                onCreateClick={() => setCreateDialogOpen(true)}
            />

            {/* Create Meal Plan Dialog */}
            <CreateMealPlanDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                homeId={homeId!}
                onSuccess={() => setCreateDialogOpen(false)}
            />
        </main>
    );
}
