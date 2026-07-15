import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import HomePage from "../pages";
import { RootLayout } from "../pages/Layout";
import VillagesPage from "../pages/villages";
import VillageDetailsPage from "../pages/village-details";
import PropertiesPage from "../pages/properties";
import PropertyDetailsPage from "../pages/property-details";
import SettingsPage from "../pages/settings";
import LoginPage from "../pages/login";

const router = createBrowserRouter(
    createRoutesFromElements(
    <>
    {/* home layout */}
    <Route path="/" element={<RootLayout/>} >
        <Route index element={<HomePage/>} />
        <Route path="villages" element={<VillagesPage/>} />
        <Route path="villages/:id" element={<VillageDetailsPage/>} />
        <Route path="properties" element={<PropertiesPage/>} />
        <Route path="properties/:id" element={<PropertyDetailsPage/>} />
        <Route path="settings" element={<SettingsPage/>} />
    </Route>
    
    {/* login route */}
    <Route path="/login" element={<LoginPage />} />
    </>
))

export default router;