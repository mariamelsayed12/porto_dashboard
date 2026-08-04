
import {  useEffect, useRef, type ReactNode } from "react"
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { networkModeAction } from "../../app/feature/NetworkSlice";
import { showErrorToast } from "../components/Ui/Toast";

interface Iprops{
    children:ReactNode
}

const InternetConnectionProvider = ({children}:Iprops) => {
    const toastIdRef = useRef<string | undefined>(undefined);
    const dispatch=useDispatch()

    
    function close() {
        if (toastIdRef.current) {
            toast.dismiss(toastIdRef.current);
        }    
    }

    function addToast(){
        toastIdRef.current = showErrorToast(
            "Offline mode. Please check your internet connection",
            {
                duration: Infinity,
            }
        );
    }

    const setOnline=()=>{

        dispatch(networkModeAction(true))
        close()
    }

    const setOffline=()=>{
        dispatch(networkModeAction(false))
        addToast()

    }

    useEffect(() => {
        //online
        window.addEventListener('online',setOnline)
        //offline
        window.addEventListener('offline',setOffline)

        return ()=>{
            // Cleanup
            window.removeEventListener('online',setOnline)
            window.removeEventListener('offline',setOffline)


        }
    }, []);



    return children
}

export default InternetConnectionProvider