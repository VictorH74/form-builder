import { AuthContext } from "@/contexts/AuthContext";
import React from "react";

export function useAuth() {
    const context = React.useContext(AuthContext)
    if (!context) throw Error("useAuth must be used within an AuthProvider")

    return context;
}