import React, { useState, useEffect } from "react";

export default function AlumniDirectory() {
  const [filters, setFilters] = useState({ batch: "", department: "", location: "", company: "" });
  const [alumni, setAlumni] = useState([]);

  useEffect(() => {
    // Fetch alumni from backend API using filters
    // Example: /api/alumni?batch=2018&department=CSE
  }, [filters]);

  return (
    <div>
      {/* Filter form: batch, department, location, company */}
      {/* Map alumni list to profile cards */}
    </div>
  );
}