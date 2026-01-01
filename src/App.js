import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ChatBox from "./ChatBox";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Page */}
        <Route path="/" element={<Login />} />

        {/* Your existing dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* TEMP CHAT TEST ROUTE */}
        {/* Change users here to test any combination */}
        <Route
          path="/chat"
          element={
            <div style={{ padding: 20 }}>
              <ChatBox user1Key="RAHUL" user2Key="CHARAN" />
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
