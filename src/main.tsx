/** @format */

import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./style.css";

const rootElement = document.getElementById("app");

if (!rootElement) {
    // Create the element if it doesn't exist (shouldn't happen in normal cases)
    const app = document.createElement("div");
    app.id = "app";
    document.body.appendChild(app);
    ReactDOM.createRoot(app).render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
} else {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <RouterProvider router={router} />
        </React.StrictMode>
    );
}
