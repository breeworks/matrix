import express from "express";
import cors from "cors";
import { client } from "./prisma";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

const allowedOrigins = [
  "https://daily-matrix.vercel.app",
  "https://matrix-71yc7mlqi-dishas-projects-ab780da9.vercel.app",
  "https://matrix-dishas-projects-ab780da9.vercel.app",
  "https://matrix-ecru.vercel.app",
];

app.use(
  cors({
    origin: function(origin, callback) {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  })
);

app.use(express.json());
app.use(cookieParser());


app.get("/getMatrix", async (req, res) => {

  const id = req.cookies.UserId; 
  
  if (!id) {
    res.status(400).json({ message: "Missing user ID in cookies." });
    return;
  }    
  console.log("Matrix ID:", id);
    
  try {    
    const user = await client.user.findUnique({ where:{ id: id } });

    if(!user){
      res.status(400).json({ message: "User not found in the database." });
      return;   
    }

    const userTodo = await client.todos.findMany({
      where: { userId: id },
    });

    console.log(userTodo);
    
    if (userTodo.length === 0) {
      res.status(404).json({ message: " Matrix not found for this ID." });
      return;
    }

    res.status(200).json({ message: `Matrix found`, data: userTodo });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});

app.post("/AddUser", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  try {
    let existingUser = await client.user.findFirst({ where: { username } });

    if (existingUser) {
      console.log("Existing User Found:", existingUser.id);
      res.cookie("UserId", existingUser.id, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
      });
      res.status(200).json({ message: "User found!", UserId: existingUser.id });
      return;
    }

    const newUser = await client.user.create({ data: { username } });

    console.log("New User Created:", newUser.id);
    res.cookie("UserId", newUser.id, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
  });

    res.status(201).json({ message: "User created successfully!", UserId: newUser.id });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

app.post("/AddMatrix", async (req, res) => {
    const { Dates, todo } = req.body;
    const userId = req.cookies.UserId;

    if (!userId) {
      res.status(400).json({ message: "User ID is missing. Please log in first." });
      return 
    }
    console.log("UserId from cookies:", userId);

    if (!Dates) {
      res.status(400).json({ message: "Date is required in ISO format!" });
      return 
    }

    console.log("cookie content",req.cookies);

    const userExists = await client.user.findUnique({
      where: { id: userId }
    });
    console.log("User found:", !!userExists);
    

    try{
      const newTodos = todo.split("\n").map((items : string)=>items.trim()).filter(Boolean);
      if (newTodos.length === 0) {
        res.status(400).json({ message: "No valid todos found." });
        return;
      }
      console.log(newTodos);

      const existingTodos = await client.todos.findMany({
          where: { Dates: new Date(Dates), userId: userId },
          orderBy: { id: "asc" },  
      });

      const existingTodoList = existingTodos.map((entry) => entry.todo);
      console.log(existingTodoList);
    
      if(JSON.stringify(existingTodoList) === JSON.stringify(newTodos)){
        res.status(200).json({ message: "No changes detected. Matrix not updated." });
        return;
      }

      const newTodosList = newTodos.map((todo: string) => todo.trim()).filter(Boolean);

      let createdEntries = [];

        for(let i = 0; i< newTodos.length;i++){
          if(existingTodos[i]){

          if(existingTodos[i].todo !== newTodosList[i]){
            const updatedTodo = await client.todos.update({
              where: { id: existingTodos[i].id },
              data: { todo: newTodosList[i] },
            });
            createdEntries.push({ id: updatedTodo.id, todo: updatedTodo.todo });
        }
        else{
          createdEntries.push({ id: existingTodos[i].id, todo: existingTodos[i].todo })
        }
      }
        else{
          console.log("Creating todo with:", { Dates, newTodos, userId });

          const createdTodo = await client.todos.create({data:{Dates: new Date(Dates), todo: newTodos[i],userId}});
          createdEntries.push({ id: createdTodo.id, todo: createdTodo.todo });
        }
      }

      if(existingTodos.length > newTodosList.length){
        const extraTodos =   existingTodos.splice(newTodosList.length);
        for (const extra of extraTodos) {
          await client.todos.delete({ where: { id: extra.id } });
      }
      res.status(201).json({
        message: "Todos updated successfully.",
        todos: createdEntries,
      });
    } 

    }catch (error) {
      console.error("Error creating todos:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
