import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface IProps {
    isAllowed?: boolean;
    redirectPath: string;
    children: ReactNode;
    data?: unknown;
}
const ProtectedRoute = ({
    isAllowed,
    redirectPath,
    children,
    data,
}: IProps) => {
    // Dynamically retrieve token from localStorage on render
    const token = localStorage.getItem("accessToken");
    const loggedInUserStr = localStorage.getItem("loggedInUser");
    const loggedInUser = loggedInUserStr ? JSON.parse(loggedInUserStr) : null;
    const isAuthenticated = !!token || !!loggedInUser?.token;

    const allowed = isAllowed !== undefined ? isAllowed : isAuthenticated;

    if (!allowed) return <Navigate to={redirectPath} replace state={data} />;
    return children;
};

export default ProtectedRoute;
