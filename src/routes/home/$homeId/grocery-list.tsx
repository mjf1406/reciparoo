/** @format */

import { createFileRoute } from "@tanstack/react-router";
import useHomeById from "@/hooks/use-home-by-id";
import { Loader2 } from "lucide-react";
import { Breadcrumb } from "@/components/ui/breadcrumb";

export const Route = createFileRoute("/home/$homeId/grocery-list")({
    component: GroceryListPage,
});

function GroceryListPage() {
    const { homeId } = Route.useParams();
    const { home, isLoading, error } = useHomeById(homeId!);

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

    return (
        <main className="container mx-auto px-4 py-8">
            <Breadcrumb
                items={[
                    { label: "Home", to: "/" },
                    { label: homeName, to: `/home/${homeId}` },
                    { label: "Grocery List" },
                ]}
                className="mb-6"
            />
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <img
                    src="/under-construction.webp"
                    alt="Under Construction"
                    className="max-w-md w-full mb-6"
                />
                <h2 className="text-2xl font-semibold mb-2">Under Construction</h2>
                <p className="text-muted-foreground">
                    This feature is currently being developed. Check back soon!
                </p>
            </div>
        </main>
    );
}
