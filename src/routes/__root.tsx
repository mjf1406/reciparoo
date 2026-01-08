/** @format */

import { createRootRoute, Outlet } from "@tanstack/react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/components/themes/theme-provider";
import { ThemeSwitch } from "@/components/themes/theme-switch";
import AuthProvider from "@/components/auth/auth-provider";

export const Route = createRootRoute({
    component: RootComponent,
});

function RootComponent() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID!;

    return (
        <ThemeProvider
            defaultTheme="dark"
            storageKey="vite-ui-theme"
        >
            <GoogleOAuthProvider clientId={googleClientId}>
                <AuthProvider>
                    <div className="relative min-h-screen">
                        <div className="fixed top-4 right-4 z-50">
                            <ThemeSwitch />
                        </div>
                        <Outlet />
                    </div>
                </AuthProvider>
            </GoogleOAuthProvider>
        </ThemeProvider>
    );
}
