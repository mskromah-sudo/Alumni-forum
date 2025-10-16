import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "./components/Auth/Register";
import AlumniDirectory from "./components/Directory/AlumniDirectory";
import JobBoard from "./components/Jobs/JobBoard";
import MentorsList from "./components/Mentorship/Mentors";
import Announcements from "./components/News/Announcements";
import EventBoard from "./components/Events/EventBoard";
import ChatForum from "./components/Networking/ChatForum";
import AdminPanel from "./components/Admin/AdminPanel";

export default function App() {
  // Use context/provider for logged-in user & role
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/directory" element={<AlumniDirectory />} />
        <Route path="/jobs" element={<JobBoard userRole="alumni" />} />
        <Route path="/mentors" element={<MentorsList userRole="student" />} />
        <Route path="/news" element={<Announcements userRole="admin" />} />
        <Route path="/events" element={<EventBoard userRole="alumni" />} />
        <Route path="/forum" element={<ChatForum userRole="student" />} />
        <Route path="/admin" element={<AdminPanel />} />
        {/* Add default/home route */}
      </Routes>
    </BrowserRouter>
  );
}