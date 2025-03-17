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
  id: string;
  date: string;
  content: string;
};

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [todo, setTodo] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [oldEntry, setOldEntry] = useState<JournalEntry[]>([]);

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    async function fetchMatrix() {
      try {
        const response = await axios.get(`http://${NEXT_PUBLIC_API_URL}/getMatrix`, {
          withCredentials: true,
        });
        console.log("Raw response:", response.data);

        if (response.data && Array.isArray(response.data.data)) {
          const formattedEntries = response.data.data.map((item: { id: string; Dates: string | number | Date; todo: string; }) => ({
            id: item.id,
            date: format(new Date(item.Dates), "yyyy-MM-dd"),
            content: item.todo,
          }));

          setJournalEntries(formattedEntries);
          setOldEntry(formattedEntries);
          console.log("Loaded journal entries:", formattedEntries);
        } else {
          console.error("Unexpected response format:", response.data);
        }
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

    const entriesForDate = journalEntries.filter(
      (entry) => entry.date === dateString
    );
    if (entriesForDate.length > 0) {

      const combinedEntry = entriesForDate
        .map((entry,index) => `${index + 1}.${entry.content}`).join("\n");
      setTodo(combinedEntry);
    } else {
      setTodo(isToday(day) ? "" : "No entries for this date");
    }
  };

  function gradient(day: Date) {
    const dateString = format(day, "yyyy-MM-dd");
    const entry = journalEntries.find((entry) => entry.date === dateString);
    const count = entry?.content.length || 0;

    if (count === 0) return "";
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
      const response = await axios.post(
        "http://localhost:3000/AddMatrix",
        { Dates, todo },
        { withCredentials: true }
      );
      toast.success("Keep your matrix updated!", {
        position: "top-center",
        autoClose: 3000,
        transition: Bounce,
      });

      const newEntryId = response.data.id || Date.now().toString();

      setJournalEntries((prev) => [
        ...prev,
        { id: newEntryId, date: dateString, content: todo },
      ]);
      setIsDialogOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to save entry!", {
        position: "top-center",
        autoClose: 3000,
        transition: Bounce,
      });
    }
    setIsDialogOpen(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 m-10 bg-white">
      <div className="min-h-screen w-full max-w-lg p-10 text-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-medium text-gray-700">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="ghost" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-sm font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day) => (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={`h-12 w-full rounded-md flex items-center justify-center ${gradient(
                day
              )}`}
            >
              {format(day, "d")}
            </button>
          ))}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDate
                  ? format(selectedDate, "MMMM d, yyyy")
                  : "Journal Entries"}
              </DialogTitle>
            </DialogHeader>

            {isToday(selectedDate || new Date()) ? (
              
              <Textarea
                className="min-h-[250px] resize-none"
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
              />
            ) : (

              <div className="min-h-[250px] overflow-y-auto p-4 bg-gray-50 rounded-md">
                {journalEntries.filter(
                  (entry) =>
                    entry.date ===
                    format(selectedDate || new Date(), "yyyy-MM-dd")
                ).length > 0 ? (
                  <ol className="list-decimal pl-6 space-y-4">
                    {journalEntries
                      .filter(
                        (entry) =>
                          entry.date ===
                          format(selectedDate || new Date(), "yyyy-MM-dd")
                      )
                      .map((entry, index) => (
                        <li key={entry.id || index} className="text-gray-800">
                          {entry.content}
                        </li>
                      ))}
                  </ol>
                ) : (
                  <p className="text-gray-500">No entries for this date</p>
                )}
              </div>
            )}

            {isToday(selectedDate || new Date()) && (
              <div className="flex justify-end">
                <Button
                  onClick={handleSubmit}
                  className="text-xl cursor-pointer"
                >
                  Save Entry
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <ToastContainer
          position="top-center"
          autoClose={3000}
          transition={Bounce}
        />
      </div>
    </main>
  );
}
