/** @format */

import { createFileRoute } from "@tanstack/react-router";
import useMealPlan from "@/hooks/use-meal-plan";
import { Loader2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Navbar } from "@/components/layout/navbar";
import { MealPlanDetail } from "@/components/meal-plans/meal-plan-detail";

export const Route = createFileRoute("/meal-plans/$mealPlanId")({
    component: MealPlanDetailPage,
});

function MealPlanDetailPage() {
    const { mealPlanId } = Route.useParams();
    const { mealPlan, isLoading, error } = useMealPlan(mealPlanId);

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

    if (!mealPlan) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <div className="flex items-center justify-center h-screen w-full">
                    <div className="text-center text-destructive">
                        <p>Meal plan not found.</p>
                    </div>
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
                        { label: "Meal Plans", to: "/calendar" },
                        { label: mealPlan.name },
                    ]}
                    className="mb-6"
                />

                <MealPlanDetail mealPlan={mealPlan} />
            </main>
        </div>
    );
}
