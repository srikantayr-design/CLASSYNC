import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot
} from "firebase/firestore";
import ChatBox from "./ChatBox";
import { USER_KEYS } from "./userKeys";
import NewsSection from "./NewsSection";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState(null);
  const [subject, setSubject] = useState("");
  const [rooms, setRooms] = useState({});
  const [reload, setReload] = useState(false);
  const [chatStudent, setChatStudent] = useState(null);
  const [chatTeacher, setChatTeacher] = useState(null);

  const students = [
    { key: "RAHUL", name: "Rahul" },
    { key: "SNEHA", name: "Sneha" },
    { key: "ARJUN", name: "Arjun" },
    { key: "MEERA", name: "Meera" }
  ];

  const teacherChatList = [
    { key: "CHARAN", name: "Charan" },
    { key: "PRANAV", name: "Pranav" },
    { key: "SRIKANTA", name: "Srikanta" },
    { key: "PRATHAM", name: "Pratham" }
  ];

  // 🔥 IMPORTANT — add correct UIDs here
  const TEACHER_UID_MAP = {
    CHARAN: "UID_OF_CHARAN",
    PRANAV: "UID_OF_PRANAV",
    SRIKANTA: "UID_OF_SRIKANTA",
    PRATHAM: "UID_OF_PRATHAM"
  };

  const days = ["Monday", "Tuesday", "Wednesday"];
  const slots = ["8-9", "9-10", "10-11", "11-12", "12-1"];
  const roomList = ["101", "102", "103", "104"];

  useEffect(() => {
    async function loadTeacher() {
      const user = auth.currentUser;
      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      setTeacher({ uid: user.uid, ...data });

      if (data.subject) setSubject(data.subject);
      if (data.subjects) setSubject(data.subjects[0]);
    }
    loadTeacher();
  }, []);

  async function mark(id, presentMark) {
    if (!subject) return alert("Subject not loaded yet");

    const ref = doc(db, "attendance", subject, "students", id);
    const snap = await getDoc(ref);

    let present = 0;
    let total = 0;

    if (snap.exists()) {
      present = snap.data().present || 0;
      total = snap.data().total || 0;
    }

    await setDoc(ref, {
      present: presentMark ? present + 1 : present,
      total: total + 1
    });

    alert("Attendance Updated");
    setReload(prev => !prev);
  }

  useEffect(() => {
    roomList.forEach(room => {
      days.forEach(async day => {
        const ref = doc(db, "classrooms", room, "schedule", day);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(ref, {
            "8-9": { status: "vacant" },
            "9-10": { status: "vacant" },
            "10-11": { status: "vacant" },
            "11-12": { status: "vacant" },
            "12-1": { status: "vacant" }
          });
        }

        onSnapshot(ref, docSnap => {
          setRooms(prev => ({
            ...prev,
            [room]: {
              ...(prev[room] || {}),
              [day]: docSnap.data()
            }
          }));
        });
      });
    });
  }, []);

  async function occupy(room, day, slot) {
    const ref = doc(db, "classrooms", room, "schedule", day);
    await updateDoc(ref, {
      [slot]: {
        status: "occupied",
        by: teacher.name,
        authority: teacher.uid
      }
    });
  }

  async function vacate(room, day, slot, authority) {
    if (authority !== teacher.uid) return alert("You don't have authority");
    const ref = doc(db, "classrooms", room, "schedule", day);
    await updateDoc(ref, {
      [slot]: { status: "vacant" }
    });
  }

  async function transfer(room, day, slot, newUid, newName) {
    const ref = doc(db, "classrooms", room, "schedule", day);
    await updateDoc(ref, {
      [slot]: {
        status: "occupied",
        by: newName,
        authority: newUid
      }
    });
  }

  const [transferKey, setTransferKey] = useState("");

  return (
    <div className="teacher-bg" style={{ textAlign: "center" }}>
      <img
        src="https://cdn-icons-png.flaticon.com/512/2784/2784461.png"
        alt="teacher"
        style={{ width: 200, marginTop: 20 }}
      />

      {teacher && <h1>Welcome {teacher.name} (Teacher)</h1>}

      {teacher?.subjects && (
        <>
          <h3>Select Subject</h3>
          <select value={subject} onChange={e => setSubject(e.target.value)}>
            {teacher.subjects.map(s => <option key={s}>{s}</option>)}
          </select>
        </>
      )}

      {!teacher?.subjects && <h3>Subject: {subject}</h3>}

      {/* ATTENDANCE */}
      <div className="glass-card">
        <h2>Attendance</h2>

        {students.map(s => (
          <StudentCard
            key={s.key}
            s={s}
            subject={subject}
            reload={reload}
            mark={mark}
          />
        ))}
      </div>

      {/* TIMETABLE */}
      <div className="glass-card">
        <h2>Classroom Availability</h2>

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
                      <th>Action</th>
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

                          <td>
                            {!data || data.status !== "occupied" ? (
                              <button onClick={() => occupy(room, day, slot)}>
                                Occupy
                              </button>
                            ) : (
                              <>
                                {data.authority === teacher?.uid ? (
                                  <>
                                    <button
                                      onClick={() =>
                                        vacate(room, day, slot, data.authority)
                                      }
                                    >
                                      Vacant
                                    </button>

                                    <select
                                      style={{ marginLeft: 10 }}
                                      value={transferKey}
                                      onChange={e => setTransferKey(e.target.value)}
                                    >
                                      <option value="">Transfer To</option>

                                      {teacherChatList
                                        .filter(t => t.key !== USER_KEYS[auth.currentUser.uid])
                                        .map(t => (
                                          <option key={t.key} value={t.key}>
                                            {t.name}
                                          </option>
                                        ))}
                                    </select>

                                    <button
                                      disabled={!transferKey}
                                      style={{ marginLeft: 10 }}
                                      onClick={() => {
                                        const teacherTarget =
                                          teacherChatList.find(t => t.key === transferKey);

                                        transfer(
                                          room,
                                          day,
                                          slot,
                                          TEACHER_UID_MAP[teacherTarget.key],
                                          teacherTarget.name
                                        );

                                        alert("Authority Transferred");
                                      }}
                                    >
                                      Transfer
                                    </button>
                                  </>
                                ) : (
                                  <span style={{ color: "red" }}>No Authority</span>
                                )}
                              </>
                            )}
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

      {/* CHAT STUDENTS */}
      <div className="glass-card">
        <h2>Chat with Students</h2>

        {!chatStudent && students.map(s => (
          <button
            key={s.key}
            style={{ margin: 6 }}
            onClick={() => setChatStudent(s.key)}
          >
            Chat with {s.name}
          </button>
        ))}

        {chatStudent && (
          <>
            {teacher && (
              <ChatBox
                user1Key={USER_KEYS[auth.currentUser.uid]}
                user2Key={chatStudent}
              />
            )}
            <br />
            <button onClick={() => setChatStudent(null)}>Close Chat</button>
          </>
        )}
      </div>

      {/* CHAT TEACHERS */}
      <div className="glass-card">
        <h2>Chat with Other Teachers</h2>

        {!chatTeacher &&
          teacherChatList.filter(
            t => t.key !== USER_KEYS[auth.currentUser.uid]
          ).map(t => (
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
            {teacher && (
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

      {/* MENTORS */}
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

/* ---------------- STUDENT CARD ---------------- */

function StudentCard({ s, subject, mark, reload }) {
  const [present, setPresent] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      if (!subject) return;
      const ref = doc(db, "attendance", subject, "students", s.key);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setPresent(snap.data().present || 0);
        setTotal(snap.data().total || 0);
      }
    }
    load();
  }, [subject, reload]);

  const percent = total === 0 ? 0 : Math.round((present / total) * 100);

  return (
    <div>
      <h3>{s.name}</h3>
      <p>{present} / {total} | {percent}%</p>

      {percent < 75 && total > 0 && (
        <p style={{ color: "red" }}>⚠️ Attendance below 75%</p>
      )}

      <button onClick={() => mark(s.key, true)}>Present</button>
      <button onClick={() => mark(s.key, false)}>Absent</button>
      <hr />
    </div>
  );
}
