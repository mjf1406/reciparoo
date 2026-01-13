/** @format */

import { createFileRoute } from "@tanstack/react-router";
import useHomeById from "@/hooks/use-home-by-id";
import useMealPlan from "@/hooks/use-meal-plan";
import { Loader2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useAuthContext } from "@/components/auth/auth-provider";
import { getUserRoleInHome } from "@/lib/utils";
import { MealPlanDetail } from "@/components/meal-plans/meal-plan-detail";

export const Route = createFileRoute("/home/$homeId/meal-plans/$mealPlanId")({
    component: MealPlanDetailPage,
});

function MealPlanDetailPage() {
    const { homeId, mealPlanId } = Route.useParams();
    const { home, isLoading: homeLoading, error: homeError } = useHomeById(homeId!);
    const { mealPlan, isLoading: mealPlanLoading, error: mealPlanError } = useMealPlan(mealPlanId!);
    const { user } = useAuthContext();

    const isLoading = homeLoading || mealPlanLoading;
    const error = homeError || mealPlanError;

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

    if (!mealPlan) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="text-center text-destructive">
                    <p>
                        Meal Plan with ID{" "}
                        <span className="inline font-bold italic text-foreground">
                            {mealPlanId}
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

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: homeName, to: `/home/${homeId}` },
                    { label: "Meal Plans", to: `/home/${homeId}/calendar` },
                    { label: mealPlan.name },
                ]}
                className="mb-6"
                role={userRole}
            />

            <MealPlanDetail mealPlan={mealPlan} />
        </main>
    );
}
