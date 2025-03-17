"use client";
import { useState } from "react";
import axios from "axios";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";


const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

export default function FrontPage() {
  const [username, setUsername] = useState<string>("");
  const router = useRouter()

  async function handleName(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    try {
      const response = await axios.post(`${NEXT_PUBLIC_API_URL}/AddUser`, {username} , {withCredentials: true});
      toast.success(`${username} welcome to matrix`, { position: "top-center", autoClose: 3000, transition: Bounce });
      const data = response.data;
      console.log(data);
      setTimeout(() => router.push("/Daily"), 2000);

    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!", { position: "top-center", autoClose: 3000, transition: Bounce });
    }
  }

  return (
    <div>
      <span className = " text-2xl font-bold "> Welcome to your matrix </span>
      <form>
        <input className="p-4 rounded-2xl ml-3.5"
          value={username}
          placeholder="your name"
          onChange={(e) => setUsername(e.target.value)}
          type="text"
        />
      </form>
      {username && (
        <button onClick={handleName}>
          <div className="text-xl font-bold ml-5" > Calendar </div>
        </button>
      )}
    <ToastContainer position="top-center" autoClose={3000} transition={Bounce} />
    </div>
  );
}
