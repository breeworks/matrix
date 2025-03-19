import express from "express";
import cors from "cors";
import { client } from "./prisma";
import zod, { number, string, z } from "zod";
import cookieParser from "cookie-parser";
import e from "express";

const app = express();
// const backend = "https://dazzling-nourishment-production.up.railway.app"
const PORT = 3000;

app.use(cors({ origin: "http://localhost:3002", credentials: true }));
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
  const data = req.body;
  const id = req.cookies.UserId;
  
  if (!id) {
    res.status(400).json({ message: "User ID is missing. Please log in first." });
    return;
  }
  
  if (!data.Dates) {
    res.status(400).json({ message: "Date is required in ISO format!" });
    return;
  }
  
  const userDate = new Date(data.Dates);
  
  const now = new Date();
  
  const isToday = 
    userDate.getUTCFullYear() === now.getUTCFullYear() &&
    userDate.getUTCMonth() === now.getUTCMonth() &&
    userDate.getUTCDate() === now.getUTCDate();
  
  console.log(`Is user date today? ${isToday}`);
  console.log(`User date: ${userDate.toISOString()}, Now: ${now.toISOString()}`);
  
  try {
    if (isToday) {
      const CreatedEntry = await client.todos.create({
        data: {
          Dates: new Date(data.Dates),
          todo: data.todo,
          userId: id
        }
      });
      
      res.status(201).json({
        message: `Matrix has been updated successfully.`,
        id: CreatedEntry.id
      });
    } else {
      const formattedNow = now.toISOString().split('T')[0];
      res.status(400).json({
        message: `Try to update matrix on the present date: ${formattedNow}.`,
        userDate: userDate.toISOString().split('T')[0]
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
  console.log('Request body:', req.body);
  console.log('User provided date (raw):', data.Dates);
  console.log('Parsed user date:', new Date(data.Dates).toISOString());
  console.log('Current server date:', new Date().toISOString());
});
app.delete("/DeleteMatrix", async (req, res) => {

  const TodoId = req.params; 

  if (!TodoId) {
    res.status(400).json({ message: "User || Todo ID is missing." });
    return;
  }  

  try {
    if (typeof TodoId !== "string") {
      throw new Error("Invalid ID: ID must be a string");
    }

    const DeleteMatrix = await client.todos.delete({
      where:{
        id: TodoId
      }
    })
    console.log(DeleteMatrix);
    res.status(201).json({message : `Todo deleted successfully ${TodoId}.`});
    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/UpdateMatrix", async (req,res) => {})

app.listen(PORT, () => console.log(`server running on ${PORT}`));
