import { createUserWithEmailAndPassword } from "firebase/auth";
import {auth} from '../components/firebase'
import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState('Djole')

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const value = {
        user, 
        signup
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}

export const UserAuth = () =>  {
    return useContext(AuthContext)
}