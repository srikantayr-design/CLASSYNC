import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import StudentDashboard from "./StudentDashboard";
import TeacherDashboard from "./TeacherDashboard";

export default function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/";
        return;
      }

      const snap = await getDoc(doc(db, "users", user.uid));
      setRole(snap.data().role);
    });
  }, []);

  if (!role) return <h2>Loading...</h2>;

  return role === "student" ? <StudentDashboard /> : <TeacherDashboard />;
}
