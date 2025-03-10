"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../component/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../component/ui/dialog";
import { Textarea } from "../component/ui/textarea";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import axios from "axios";
import { Bounce, ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type JournalEntry = {
  date: string;
  content: string;
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [todo, setTodo] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [oldEntry, setOldEntry] = useState<string>("");

  useEffect(() => {
    async function fetchMatrix() {
      try {
        const response = await axios.get("http://localhost:3000/getMatrix", {
          withCredentials: true,
        });
        const data = Array.isArray(response.data) ? response.data : [];

        setJournalEntries(data);
        console.log("Retrieved Matrix:", data);
      } catch (error) {
        console.error("Error fetching matrix:", error);
      }
    }
    fetchMatrix();
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDateClick = (day: Date) => {
    setSelectedDate(day);
    setIsDialogOpen(true);

    const dateString = format(day, "yyyy-MM-dd");
    if (Array.isArray(journalEntries)) {
      const existingEntry = journalEntries.find((entry) => entry.date === dateString);
      setTodo(existingEntry?.content || "");
    } else {
      console.error("journalEntries is not an array:", journalEntries);
      setTodo("");
    }
    };

  function gradient(day: Date) {
    const dateString = format(day, "yyyy-MM-dd");
    const entry = journalEntries.find((entry) => entry.date === dateString);
    const count = entry?.content.length || 0;

    if (!isToday(day) && count === 0) return "";
    if (count < 9) return "bg-gradient-to-r from-blue-400 to-green-400";
    if (count < 12) return "bg-gradient-to-r from-green-400 to-yellow-400";
    if (count < 15) return "bg-gradient-to-r from-yellow-400 to-orange-400";
    return "bg-gradient-to-r from-orange-400 to-red-500";
  }

  async function handleSubmit() {
    if (!selectedDate || !todo.trim()) return;

    const dateString = format(selectedDate, "yyyy-MM-dd");
    const Dates = new Date(dateString).toISOString();

    try {
      await axios.post("http://localhost:3000/AddMatrix", { Dates, todo }, { withCredentials: true });
      toast.success("Keep your matrix updated!", { position: "top-center", autoClose: 3000, transition: Bounce });

      setJournalEntries((prev) => {
        const existingEntryIndex = prev.findIndex((entry) => entry.date === dateString);
        if (existingEntryIndex >= 0) {
          const updated = [...prev];
          updated[existingEntryIndex] = { date: dateString, content: todo };
          return updated;
        } else {
          return [...prev, { date: dateString, content: todo }];
        }
      });
    } catch (error) {
      console.log(error);
      toast.error("Enter matrix for the same date only!", { position: "top-center", autoClose: 3000, transition: Bounce });
    }
    setIsDialogOpen(false);
  }

  return (
    <div className="min-h-screen w-full max-w-lg p-10 text-2xl">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
        <h2 className="text-xl font-medium text-gray-700">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="ghost" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-sm font-medium">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {daysInMonth.map((day) => (
          <button
            key={day.toString()}
            onClick={() => handleDateClick(day)}
            className={`h-12 w-full rounded-md flex items-center justify-center ${gradient(day)}`}
          >
            {format(day, "d")}
          </button>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Journal Entry"}</DialogTitle>
          </DialogHeader>
          <Textarea
            className="min-h-[250px] resize-none"
            value={isToday(selectedDate || new Date()) ? todo : oldEntry}
            onChange={(e) => setTodo(e.target.value)}
            readOnly={!isToday(selectedDate || new Date())}
          />
          {isToday(selectedDate || new Date()) && (
            <div className="flex justify-end">
              <Button onClick={handleSubmit} className="text-xl cursor-pointer">Save Entry</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer position="top-center" autoClose={3000} transition={Bounce} />
    </div>
  );
}