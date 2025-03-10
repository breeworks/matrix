import express from "express";
import cors from "cors";
import { client } from "./prisma";
import zod, { number, string, z } from "zod";
import cookieParser from "cookie-parser";

const app = express();
const PORT = 3000;

app.use(cors({
  origin: "http://localhost:3002",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// const matrixSchema = zod.object({
//     // date : zod.string().date(),
//     todo : zod.string()
// })

app.get("/getMatrix", async (req, res) => {
  const id = req.cookies.id; 
   
  console.log("Matrix ID:", id);

  if (!id) {
    res.status(400).json({ message: "Missing user ID in cookies." });
  }

  try {
    const CheckMatrix = await client.user.findUnique({
      where: { id: id },
    });

    if (CheckMatrix) {
      res.status(200).json({ message: `Matrix found: ${CheckMatrix.todo}` });
    } else {
      res.status(404).json({ message: "Matrix not found for this ID." });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
});


app.post("/AddMatrix", async (req, res) => {

  const data = req.body;

  // if currentTime is equal to time when user id creating matxic 👍 but if user's time is a ahead to before the current time 👎
  if (!data.Dates) {
    res.status(400).json({ message: "Date is required in ISO format!" });
  }

  const today = new Date();
  const currentDate = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1
  )
    .toISOString()
    .split("T")[0];

  const userDate = data.Dates.split("T")[0]; 

// "Your matrix for today has been updated with id 0a2ae97a-9314-44c0-8b34-fd3170a16b51 on date 2025-03-10"

  try {
    if (currentDate == userDate) {
      const CreatedMatrix = await client.user.create({
        data: {
          Dates: data.Dates,
          todo: data.todo,
        },
      });
      res.cookie("id", CreatedMatrix.id, { maxAge: 90000000, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"   });

      res.status(201).json({  
        message: `Your matrix for today has been updated with id ${CreatedMatrix.id} on date ${userDate}`,
      });
      return;
    } 
    else {
      res.status(400).json({message: `Try to update matrix at present date ${currentDate}.`});
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`server running on ${PORT}`));
