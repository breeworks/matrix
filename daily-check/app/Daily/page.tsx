"use client"; 

import { useState } from "react";
import axios from "axios";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

export default function Daily() {
  const [currentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [todoInput, setTodoInput] = useState("");
  const [todos, setTodos] = useState<Record<number, string[]>>({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const months = currentDate.toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function handleClick(day: number) {
    setSelectedDay(day);
  }

  async function FetchMatrix() {
    if (!selectedDay || todoInput.trim() === "") return;
    
    try {
      const Dates = new Date(year, month, selectedDay + 1).toISOString();
      
      const response = await axios.post("http://localhost:3000/AddMatrix", {
        todo: todoInput,
        Dates,
      });

      if (response.status === 201) {
        setTodos((prevTodos) => ({
          ...prevTodos,
          [selectedDay]: [...(prevTodos[selectedDay] || []), todoInput],
        }));

        setTodoInput("");

        toast.success("Keep your matrix updated!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error("Error sending request:", error);
      toast.error("Enter matrix for the same date only!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Bounce,
      });
    }
  }

  function getGradient(day: number) {
    const count = todos[day]?.length || 0;

    if (count === 0) return "bg-gray-300";
    if (count === 1) return "bg-gradient-to-r from-blue-400 to-green-400";
    if (count === 2) return "bg-gradient-to-r from-green-400 to-yellow-400";
    if (count === 3) return "bg-gradient-to-r from-yellow-400 to-orange-400";
    return "bg-gradient-to-r from-orange-400 to-red-500";
  }

  return (
    <div className="flex justify-center align-middle min-h-screen">
      <div className="p-10 m-15 border-2 rounded-2xl w-dvh h-210">
        <div className="text-3xl font-mono flex justify-center p-2">
          CALENDAR 2025: {months} {selectedDay}
        </div>

        <div className="grid grid-cols-7 gap-4 p-4">
          {days.map((day) => (
            <div
              key={day}
              className={`cursor-pointer p-4 text-center rounded-xl ${getGradient(day)}`}
              onClick={() => handleClick(day)}
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      {selectedDay && (
        <div className="mt-20 p-4 border-0 rounded-2xl">
          <h2 className="text-xl font-bold">What did you do on {selectedDay}?</h2>
          <input
            type="text"
            value={todoInput}
            placeholder="Enter your activity"
            onChange={(e) => setTodoInput(e.target.value)}
            className="border p-2 w-full mt-2 rounded-md"
          />
          <button
            className="mt-3 border-2 rounded-2xl cursor-pointer text-lg px-4 py-2 bg-gray-300 text-white"
            onClick={FetchMatrix}
          >
            Add to matrix
          </button>

          <ul className="mt-4 list-disc pl-6">
            {todos[selectedDay]?.map((todo, index) => (
              <li key={index} className="text-lg">{todo}</li>
            ))}
          </ul>

          <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} draggable pauseOnHover theme="colored" transition={Bounce} />
        </div>
      )}
    </div>
  );
}
