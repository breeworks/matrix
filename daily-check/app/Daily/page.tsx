"use client"

import { useState } from "react";
import date from "../component/ui/date";
import axios from "axios";

export default function Daily() {

  const [currentDate] = useState(new Date());
  const [todo, settodo] = useState("")
  const [selectedDay, setSelectedDay] = useState<number>();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const Activedate = new Date(currentDate);  // 2009-11-10
  const months = Activedate.toLocaleString('default', { month: 'long' });


  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // const Dates = new Date(year, month, daysInMonth).toISOString(); 
  const Dates = selectedDay ? new Date(year, month, selectedDay + 1).toISOString() : "";
  console.log(Dates);
  

  const days = [];
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  function handleClick(day: number) { setSelectedDay(day) }


  async function FetchMatrix() {
    try {
      const response = await axios.post("http://localhost:3000/AddMatrix", { todo, Dates});
      settodo(todo)
      settodo(""); 
      console.log(response.data);
    } catch (error) {
      console.error("Error sending request:", error);
    }
  }
  
  return (
    <div className=" flex justify-center align-middle min-h-screen ">
      <div className=" p-10 m-15 border-4 rounded-2xl w-dvh h-210  ">
        <div className="text-5xl font-mono flex justify-center p-2"> CALENDER 2025 : {months} </div>
          <div className="grid grid-cols-7 gap-12 p-4">
            {days.map((day) => ( <div key={day} onClick={()=>handleClick(day)} > {date(day)} </div> ))}
        </div>
      </div>
      {selectedDay !== null && (
        <div className="mt-60 p-4 border-2 rounded-2xl h-100 ">
        <h2 className="text-xl font-bold">What did you do on {selectedDay}?</h2>
        <input
          type="text"
          value={todo}
          placeholder="So what did you do today?"
          onChange={(e) => settodo(e.target.value)}
          className="border p-2 w-full mt-2 rounded-md"
        />
        <button className="mt-2 border-2 rounded-2xl hover:bg-amber-300 text-lg px-4 py-2" onClick={FetchMatrix} >
          Submit
        </button>
      </div>
    )}
    </div>
  );
}
