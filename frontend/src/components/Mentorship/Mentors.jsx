import React, { useState, useEffect } from "react";

export default function JobBoard({ userRole }) {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ title: "", company: "", type: "Full-time" });

  useEffect(() => {
    // Fetch job/internship data from backend
  }, []);

  const handlePost = () => {
    // Post job to backend if userRole === "alumni"
  };

  return (
    <div>
      {userRole === "alumni" && (
        <form>
          {/* New job posting form (title, company, type: Internship/Full-time/Remote) */}
        </form>
      )}
      {/* List jobs, allow students to apply / contact */}
    </div>
  );
}