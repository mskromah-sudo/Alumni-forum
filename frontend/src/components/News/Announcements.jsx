import React, { useState, useEffect } from "react";

export default function Announcements({ userRole }) {
  // Admin can post, others can view
  return (
    <div>
      {/* List of announcements/newsletters */}
      {userRole === "admin" && (
        <form>{/* Post new announcement */}</form>
      )}
    </div>
  );
}