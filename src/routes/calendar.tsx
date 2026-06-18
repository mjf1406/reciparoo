/** @format */

import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import useMealPlans from "@/hooks/use-meal-plans";
import { Calendar, Loader2, Plus } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";
import { useAuthContext } from "@/components/auth/auth-provider";
import { MealPlansGrid } from "@/components/meal-plans/meal-plans-grid";
import { CreateMealPlanDialog } from "@/components/meal-plans/create-meal-plan-dialog";

export const Route = createFileRoute("/calendar")({
    component: CalendarPage,
});

function CalendarPage() {
    const { mealPlans, isLoading, error } = useMealPlans();
    const { canEdit } = useAuthContext();
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center h-screen">
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" /> Loading...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    Error: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: "Home", to: "/" },
                        { label: "Meal Plans" },
                    ]}
                    className="mb-6"
                />

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Calendar className="h-8 w-8 text-primary" />
                        Meal Plans
                    </h1>
                    {canEdit && mealPlans.length > 0 && (
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Meal Plan
                        </Button>
                    )}
                </div>

                <MealPlansGrid
                    mealPlans={mealPlans}
                    onCreateClick={
                        canEdit ? () => setCreateDialogOpen(true) : undefined
                    }
                />

                {canEdit && (
                    <CreateMealPlanDialog
                        open={createDialogOpen}
                        onOpenChange={setCreateDialogOpen}
                        onSuccess={() => setCreateDialogOpen(false)}
                    />
                )}
            </main>
        </div>
    );
}
