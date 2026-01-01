


import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import ChatBox from "./ChatBox";
import { USER_KEYS } from "./userKeys";
import NewsSection from "./NewsSection";

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [rooms, setRooms] = useState({});
  const [chatTeacher, setChatTeacher] = useState(null);

  const days = ["Monday", "Tuesday", "Wednesday"];
  const slots = ["8-9", "9-10", "10-11", "11-12", "12-1"];
  const roomList = ["101", "102", "103", "104"];
  const subjects = ["Kannada", "Mathematics", "Physics", "Chemistry", "C Programming"];

  const teacherList = [
    { key: "CHARAN", name: "Charan" },
    { key: "PRANAV", name: "Pranav" },
    { key: "PRATHAM", name: "Pratham" },
    { key: "SRIKANTA", name: "Srikanta" }
  ];

  useEffect(() => {
    loadStudent();
    subscribeRooms();
    loadAttendance();
  }, []);

  async function loadStudent() {
    const user = auth.currentUser;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) setStudent(snap.data());
  }

  function loadAttendance() {
    subjects.forEach(sub => {
      const user = auth.currentUser;
      const ref = doc(db, "attendance", sub, "students", user.uid);

      onSnapshot(ref, snap => {
        setAttendance(prev => ({
          ...prev,
          [sub]: snap.exists() ? snap.data() : { present: 0, total: 0 }
        }));
      });
    });
  }

  function subscribeRooms() {
    roomList.forEach(room => {
      days.forEach(day => {
        const ref = doc(db, "classrooms", room, "schedule", day);

        onSnapshot(ref, snap => {
          setRooms(prev => ({
            ...prev,
            [room]: {
              ...(prev[room] || {}),
              [day]: snap.data()
            }
          }));
        });
      });
    });
  }

  return (
    <div className="student-bg" style={{ textAlign: "center" }}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/201/201818.png"
        alt="student"
        style={{ width: 180, marginTop: 20 }}
      />

      {student && <h1>Welcome {student.name} (Student)</h1>}

      <div className="glass-card">
        <h2>Your Attendance</h2>
      </div>

      {subjects.map(sub => {
        const data = attendance[sub] || { present: 0, total: 0 };
        const percent =
          data.total === 0 ? 0 : Math.round((data.present / data.total) * 100);

        return (
          <div key={sub}>
            <h3>{sub}</h3>
            <p>{data.present} / {data.total} | {percent}%</p>

            {percent < 75 && data.total > 0 && (
              <p style={{ color: "red" }}>⚠️ Attendance below 75%</p>
            )}
            <hr />
          </div>
        );
      })}

      <div className="glass-card">
        <h2>Live Classroom Timetable</h2>

        {roomList.map(room => (
          <div key={room} style={{ margin: 20, padding: 10, border: "2px solid black" }}>
            <h2>Room {room}</h2>

            {days.map(day => (
              <div key={day}>
                <h3>{day}</h3>

                <table border="1" style={{ margin: "auto" }}>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {slots.map(slot => {
                      const data = rooms?.[room]?.[day]?.[slot];

                      return (
                        <tr key={slot}>
                          <td>{slot}</td>
                          <td>
                            {data?.status === "occupied"
                              ? `Occupied by ${data.by}`
                              : "Vacant"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="glass-card">
        <h2>Chat With Teachers</h2>

        {!chatTeacher && teacherList.map(t => (
          <button
            key={t.key}
            style={{ margin: 6 }}
            onClick={() => setChatTeacher(t.key)}
          >
            Chat with {t.name}
          </button>
        ))}

        {chatTeacher && (
          <>
            {student && (
              <ChatBox
                user1Key={USER_KEYS[auth.currentUser.uid]}
                user2Key={chatTeacher}
              />
            )}
            <br />
            <button onClick={() => setChatTeacher(null)}>Close Chat</button>
          </>
        )}
      </div>

      <div className="glass-card">

        <h2>Mentors & Counsellors</h2>

        <h3>Mrs. Kavya (Counsellor)</h3>
        <p>Email: kavya@college.edu</p>
        <p>Timing: 3 PM – 5 PM</p>

        <h3>Dr. Ramesh (Academic Mentor)</h3>
        <p>Email: ramesh@college.edu</p>
        <p>Timing: 11 AM – 1 PM</p>
      </div>

      <NewsSection />
    </div>
  );
}
