import {  createSlice } from "@reduxjs/toolkit";


const initialState={
    isOnline:true
};

const networkSlice=createSlice({
    name:"netwok",
    initialState,
    reducers:{
        networkModeAction:(state,action)=>{
            state.isOnline=action.payload
        }
    }
})
export const {networkModeAction}=networkSlice.actions
export default networkSlice.reducer