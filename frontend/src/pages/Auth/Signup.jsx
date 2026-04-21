import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../../api/auth";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signupUser(form);
      alert("Signup successful");

      navigate("/login"); // redirect to login
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="p-6 border rounded w-80 space-y-4">

        <h2 className="text-xl font-semibold">Signup</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button className="w-full bg-black text-white p-2">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;