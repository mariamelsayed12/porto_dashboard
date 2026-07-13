import { createBrowserRouter, createRoutesFromElements, Route } from "react-router-dom";
import HomePage from "../pages";
import { RootLayout } from "../pages/Layout";






const router = createBrowserRouter(
    createRoutesFromElements(
    <>
    {/* home layout */}
    <Route path="/" element={<RootLayout/>} >

        <Route index  element={<HomePage/>} />
        <Route path="villages" element={<div>Villages</div>} />
        <Route path="properties" element={<div>Properties</div>} />
        <Route path="settings" element={<div>Settings</div>} />
    </Route>
    
    </>
    
))

export default router;