import { auth } from "../../firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithEmailAndPassword} from "firebase/auth";

//create user with email and password function
export const doCreateUserWithEmailAndPassword = async (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

//sign in user with email and password function
export const doSignInWithEmailAndPassword = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
};

//sign out user function
export const doSignOut = () => {
    return auth.signOut();
};

