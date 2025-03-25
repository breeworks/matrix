"use client";
import { useState, useEffect, KeyboardEvent } from "react";
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

  const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function fetchMatrix() {
      try {
        const response = await axios.get(`${NEXT_PUBLIC_API_URL}/getMatrix`, {
          withCredentials: true,
        });

        if (response.data && Array.isArray(response.data.data)) {
          const formattedEntries = response.data.data.map(
            (item: { id: string; Dates: string | number | Date; todo: string }) => ({
              id: item.id,
              date: format(new Date(item.Dates), "yyyy-MM-dd"),
              content: item.todo,
            })
          );
          setJournalEntries(formattedEntries);
          console.log(formattedEntries); 
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
    const entriesForDate = journalEntries.filter((entry) => entry.date === dateString);

    if (entriesForDate.length > 0) {
      // setTodo(entriesForDate[0].content || "");
      setTodo(entriesForDate.map(entry => entry.content).join("\n"));
    } else {
      setTodo(isToday(day) ? "1. " : "No entries for this date");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const currentText = todo;
      const lines = currentText.split('\n');
      const lastLine = lines[lines.length - 1];
      
      const match = lastLine.match(/^(\d+)\.\s/);
      
      if (match) {
        const currentNumber = parseInt(match[1], 10);
        const nextNumber = currentNumber + 1;

        if (lastLine.trim() === `${currentNumber}. `) {
          lines[lines.length - 1] = `${nextNumber}. `;
        } else {
          lines.push(`${nextNumber}. `);
        }
        
        setTodo(lines.join('\n'));
      } else {
        setTodo(currentText + '\n1. ');
      }
    }
  };

  function gradient(day: Date) {
    const dateString = format(day, "yyyy-MM-dd");
    const entry = journalEntries.find((entry) => entry.date === dateString);
    const count = entry?.content.length || 0;

    if (count === 0) return "";
    if (count < 9) return "bg-gradient-to-r from-purple-200 via-purple-200 to-purple-300";
    if (count < 12) return "bg-gradient-to-r from-purple-300 via-purple-400 to-purple-600";
    if (count < 15) return "bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800";
    return "bg-gradient-to-r from-purple-200 via-purple-300 to-purple-400";
  }

  async function handleSubmit() {
    if (!selectedDate || !todo.trim()) return;

    const dateString = format(selectedDate, "yyyy-MM-dd");
    const utcDate = new Date(dateString + "T00:00:00.000Z").toISOString();
    
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_API_URL}/AddMatrix`,
        { Dates: utcDate, todo },
        { withCredentials: true }
      );

      toast.success("Keep your matrix updated!", {
        position: "top-center",
        autoClose: 3000,
        transition: Bounce,
      });

      const newEntryId = response.data.id || Date.now().toString();

      setJournalEntries((prev) => {
        const filteredEntries = prev.filter(entry => entry.date !== dateString);
        return [...filteredEntries, { id: newEntryId, date: dateString, content: todo }];
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save entry!", {
        position: "top-center",
        autoClose: 3000,
        transition: Bounce,
      });
      console.log(error);
    }
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
      <div className="min-h-screen w-full max-w-lg p-10 m-28 text-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={prevMonth}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold  text-gray-700">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button variant="ghost" onClick={nextMonth}>
            <ChevronRight className="h-5 w-5" />
          </Button>
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
              <DialogTitle>
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Journal Entries"}
              </DialogTitle>
            </DialogHeader>

            {isToday(selectedDate || new Date()) ? (
              <Textarea
                className="resize-y min-h-[200px] max-h-[500px] whitespace-pre-wrap font-mono"
                value={todo}
                onChange={(e) => setTodo(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="1. "
              />
            ) : (
              <div className="min-h-[250px] overflow-y-auto p-4 bg-gray-50 rounded-md">
                {journalEntries.filter(
                  (entry) => entry.date === format(selectedDate || new Date(), "yyyy-MM-dd")
                ).length > 0 ? (
                  <div className="whitespace-pre-wrap font-mono text-gray-800">
                    {journalEntries
                      .filter((entry) => entry.date === format(selectedDate || new Date(), "yyyy-MM-dd"))
                      .map((entry) => entry.content)
                      .join('\n')}
                  </div>
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

        <ToastContainer position="top-center" autoClose={3000} transition={Bounce} />
      </div>
    </main>
  );
}
