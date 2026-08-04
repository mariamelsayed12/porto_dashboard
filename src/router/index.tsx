import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import HomePage from "../pages";
import { RootLayout } from "../pages/Layout";
import VillagesPage from "../pages/villages";
import VillageDetailsPage from "../pages/village-details";
import PropertiesPage from "../pages/properties";
import PropertyDetailsPage from "../pages/property-details";
import SettingsPage from "../pages/settings";
import LoginPage from "../pages/login";
import ProtectedRoute from "../auth/ProtectedRout";



const router = createBrowserRouter(
    createRoutesFromElements(
    <>
    {/* home layout */}
    <Route path="/" element={<RootLayout/>} >
        <Route index element={
            <ProtectedRoute redirectPath="/login">
            <HomePage/>
            </ProtectedRoute>
        }  
        />
        <Route path="villages" element={
            <ProtectedRoute redirectPath="/login">
            <VillagesPage/>
            </ProtectedRoute>
        }
        />
        <Route path="villages/:id" element={
            <ProtectedRoute redirectPath="/login">
            <VillageDetailsPage/>
            </ProtectedRoute>
        }
        />
        <Route path="properties" element={
            <ProtectedRoute redirectPath="/login">
            <PropertiesPage/>
            </ProtectedRoute>
        }
        />
        <Route path="properties/:id" element={
            <ProtectedRoute redirectPath="/login">
            <PropertyDetailsPage/>
            </ProtectedRoute>
        }
        />
        <Route path="settings" element={
            <ProtectedRoute redirectPath="/login">
            <SettingsPage/>
            </ProtectedRoute>
        }
        />
    </Route>
    
    {/* login route */}
    <Route path="/login" element={<LoginPage />} />
    {/* <Route path="/reset-password" element={<ResetPasswordPage />} /> */}
    </>
))

export default router;