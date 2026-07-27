import { RouterProvider } from "react-router-dom";
import router from "./router";
import { ToastProvider } from "./components/Ui/Toast";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ToastProvider />
    </>
  );
}

export default App;
