import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export default function Login() {
  async function login() {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        name: user.displayName,
        email: user.email,
        role: "student" 
      });
    }

    window.location.href = "/dashboard";
  }

  return (
    <div>
      <h1>CLASS SYNC</h1>
      <button onClick={login}>Login with Google</button>
    </div>
  );
}