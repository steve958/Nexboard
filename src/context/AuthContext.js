import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import {auth} from '../components/firebase' 
import { useContext, createContext, useState, useEffect } from "react";

const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const [currentTask, setCurrentTask] = useState({})
    const [project, setProject] = useState('')
    
    useEffect(()=> {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            setUser(user)
        })
        return unsubscribe
    },[])

    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

     function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        return signOut(auth)
    }

    function handleSelectedTask(task) {
        setCurrentTask(task)
    }


    const value = {
        user, 
        signup,
        login,
        logout,
        currentTask,
        handleSelectedTask,
        project,
        setProject,
    }

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    )
}

export const UserAuth = () =>  {
    return useContext(AuthContext)
}