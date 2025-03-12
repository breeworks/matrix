import express from "express";
import cors from "cors";
import { client } from "./prisma";
import zod, { number, string, z } from "zod";
import cookieParser from "cookie-parser";
import e from "express";

const app = express();
const PORT = 3000;

app.use(cors({ origin: "http://localhost:3002", credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.get("/getMatrix", async (req, res) => {
  const id = req.cookies.UserId; 

  console.log("Matrix ID:", id);

  if (!id) {
    res.status(400).json({ message: "Missing user ID in cookies." });
    return;
  }

  try {
    const CheckMatrix = await client.todos.findMany({
      where: { userId: id },
    });

    console.log(CheckMatrix);
    
    if (CheckMatrix.length === 0) {
      res.status(404).json({ message: " Matrix not found for this ID." });
      return;
    }

    res.status(200).json({ message: `Matrix found`, data: CheckMatrix });

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});

app.post("/AddUser", async(req,res)=>{

  const data = req.body
  const id = req.cookies.UserId

  try {

    if(await client.user.findUnique({where:{ id : id }}))
      res.status(201).json({message : "this user name is already taken, find other."})
    else{
      const CreatedMatrix = await client.user.create({
        data: {
          username: data.username 
        },
      });
      
    res.cookie("UserId", CreatedMatrix.id, { 
      maxAge: 90000000, 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax" 
    });

    res.status(201).json({ message: "User created successfully!", UserId: CreatedMatrix.id });
    return;
  }

  } catch (error) {
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
      // created the user

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
