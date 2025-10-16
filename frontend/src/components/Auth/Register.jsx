import React, { useState } from "react";

export default function Register({ onRegister }) {
  const [form, setForm] = useState({
    email: "", otp: "", role: "alumni", name: "", graduationYear: "", course: "", job: "", location: ""
  });
  // ...handle form change, OTP verification, and role selection logic

  return (
    <form>
      <input name="email" placeholder="Email" required />
      {/* Show OTP input after email submit */}
      <select name="role">
        <option value="alumni">Alumni</option>
        <option value="student">Student</option>
        <option value="admin">Admin</option>
      </select>
      {/* Other profile fields */}
      {/* Submit button */}
    </form>
  );
}