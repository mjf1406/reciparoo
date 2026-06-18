/** @format */

import { createFileRoute } from "@tanstack/react-router";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { UnderConstructionImage } from "@/components/ui/under-construction-image";
import { Navbar } from "@/components/layout/navbar";

export const Route = createFileRoute("/pantry")({
    component: PantryPage,
});

function PantryPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <Breadcrumb
                    items={[
                        { label: "Home", to: "/" },
                        { label: "Pantry/Fridge" },
                    ]}
                    className="mb-6"
                />
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <UnderConstructionImage />
                </div>
            </main>
        </div>
    );
}
