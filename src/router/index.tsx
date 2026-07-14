import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import HomePage from "../pages";
import { RootLayout } from "../pages/Layout";
import VillagesPage from "../pages/villages";
import PropertiesPage from "../pages/properties";
import SettingsPage from "../pages/settings";

const router = createBrowserRouter(
    createRoutesFromElements(
    <>
    {/* home layout */}
    <Route path="/" element={<RootLayout/>} >
        <Route index element={<HomePage/>} />
        <Route path="villages" element={<VillagesPage/>} />
        <Route path="properties" element={<PropertiesPage/>} />
        <Route path="settings" element={<SettingsPage/>} />
    </Route>
    </>
))

export default router;