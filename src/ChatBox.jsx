import { auth } from "./firebase";
import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc,
  doc
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";
import { USER_KEYS } from "./userKeys";

// UID → NAME
const KEY_BY_UID = USER_KEYS;

// NAME → UID
const UID_BY_KEY = Object.fromEntries(
  Object.entries(USER_KEYS).map(([uid, key]) => [key, uid])
);

export default function ChatBox({ user2Key }) {

  const [ready, setReady] = useState(false);
  const [currentUid, setCurrentUid] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setCurrentUid(user?.uid || null);
      setReady(true);
    });
    return () => unsub();
  }, []);

  // current logged user name
  const currentKey =
    KEY_BY_UID[currentUid] ||
    "UNKNOWN";

  // other user UID
  const otherUid = UID_BY_KEY[user2Key] || null;

  // ---- ALWAYS SAME ROOM BOTH SIDES (UID BASED) ----
  const roomId = [currentUid, otherUid]
    .filter(Boolean)
    .sort()
    .join("_");

  console.log("CHAT DEBUG");
  console.log("currentUid =", currentUid);
  console.log("currentKey =", currentKey);
  console.log("user2Key =", user2Key);
  console.log("otherUid =", otherUid);
  console.log("roomId =", roomId);

  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);

  // ---- CREATE ROOM + LISTEN ----
  useEffect(() => {
    if (!ready || !currentUid || !otherUid || !roomId) return;

    setDoc(
      doc(db, "chats", roomId),
      { users: [currentUid, otherUid] },
      { merge: true }
    );

    const q = query(
      collection(db, "chats", roomId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsub = onSnapshot(q, snap => {
      const data = [];
      snap.forEach(d => data.push(d.data()));
      setMessages(data);
    });

    return () => unsub();
  }, [ready, currentUid, otherUid, roomId]);

  // ---- SEND MESSAGE ----
  async function sendMessage() {
    if (!msg.trim()) return;

    await addDoc(collection(db, "chats", roomId, "messages"), {
      senderId: currentUid,
      senderName: currentKey,
      text: msg,
      timestamp: serverTimestamp()
    });

    setMsg("");
  }

  if (!ready || !currentUid)
    return (
      <div style={{ width: 420, border: "2px solid #444", padding: 12, borderRadius: 10 }}>
        <h2>Loading chat...</h2>
      </div>
    );

  return (
    <div
      style={{
        width: 420,
        border: "2px solid #444",
        padding: 12,
        borderRadius: 10
      }}
    >
      <h2>Chat</h2>

      <div
        style={{
          height: 300,
          overflowY: "auto",
          border: "1px solid gray",
          padding: 10,
          marginBottom: 10,
          borderRadius: 6
        }}
      >
        {messages.map((m, i) => (
          <p key={i}>
            <b>{m.senderName}: </b>
            {m.text}
          </p>
        ))}
      </div>

      <input
        style={{
          width: "75%",
          padding: 8,
          borderRadius: 6,
          border: "1px solid gray",
          marginRight: 8
        }}
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Type message..."
      />

      <button
        onClick={sendMessage}
        style={{
          padding: "8px 15px",
          borderRadius: 6,
          border: "none",
          background: "#007bff",
          color: "white",
          cursor: "pointer"
        }}
      >
        Send
      </button>
    </div>
  );
}
