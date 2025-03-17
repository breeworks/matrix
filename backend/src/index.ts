import express from "express";
import cors from "cors";
import { client } from "./prisma";
import zod, { number, string, z } from "zod";
import cookieParser from "cookie-parser";
import e from "express";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "https://https://dazzling-nourishment", credentials: true }));
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

app.post("/AddUser", async(req,res)=>{

  const {username} = req.body
  const id = req.cookies.UserId

  if (!username) {
    res.status(400).json({ message: "Username is required" });
    return;
  }

  try {

    let existingUser = await client.user.findFirst({where: {username}});

    if(existingUser){
      res.cookie("UserId",existingUser.id,{
        maxAge: 7 * 24 * 60 * 60 * 1000, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production", 
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" 
      });
      res.status(200).json({ message: "User found!", UserId: existingUser.id });
      return;
    }
    const newUser = await client.user.create({
      data: { username }
    });

    res.cookie("UserId", newUser.id, { 
      maxAge: 7 * 24 * 60 * 60 * 1000, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" 
    });

    res.status(201).json({ message: "User created successfully!", UserId: newUser.id });
    return;
  }
     catch (error) {
    res.status(404).json({error});
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

  const today = new Date();
  const currentDate = new Date( today.getFullYear(),today.getMonth(), today.getDate() + 1).toISOString().split("T")[0];

  const userDate = data.Dates.split("T")[0]; 

  try {
    if (currentDate === userDate) {

      const CreatedEntry = await client.todos.create({
        data:{
          Dates: new Date(userDate),
          todo: data.todo,
          userId: id
        }
      })

      res.status(201).json({  
        message: `matrix for today ${CreatedEntry.todo} has been updated  on ${userDate}`,
      });
      return;
      
    } else {
      res.status(400).json({message: `Try to update matrix on the present date: ${currentDate}.`});
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
