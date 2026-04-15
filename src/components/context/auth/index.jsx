import React, {useContext, useState, useEffect} from "react";
import {auth} from "../../../firebase";
import {onAuthStateChanged} from "firebase/auth";
const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }){
    //set initialize state of user, userloggedin, and loading user
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, [])

    //initialize user function
    async function initializeUser(user){
        //user logged in
        if(user){
            setCurrentUser({ ...user });
            setUserLoggedIn(true);
        }
        //user logged out
        else{
            setCurrentUser(null);
            setUserLoggedIn(false);
        }
        setLoading(false);
    }

    const value = {
        currentUser,
        userLoggedIn,
        loading
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}