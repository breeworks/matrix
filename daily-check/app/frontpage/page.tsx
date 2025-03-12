"use client";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function FrontPage() {
  const [username, setUsername] = useState<string>("");

  async function handleName() {
    try {
      const response = await axios.post("http://localhost:3000/AddUser", {username} , {withCredentials: true});
      const data = response.data;
      console.log(data);
      toast.success(`${username} welcome to matrix`, { position: "top-center", autoClose: 3000, transition: Bounce });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!", { position: "top-center", autoClose: 3000, transition: Bounce });
    }
  }

  return (
    <div>
      <span>Welcome to your matrix</span>
      <form>
        <input
          value={username}
          placeholder="your name"
          onChange={(e) => setUsername(e.target.value)}
          type="text"
        />
      </form>
      {username && (
        <Link href="/Daily" onClick={handleName}>
          <div> Calendar </div>
        </Link>
      )}
    <ToastContainer position="top-center" autoClose={3000} transition={Bounce} />
    </div>
  );
}
