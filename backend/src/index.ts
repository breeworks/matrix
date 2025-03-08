import express from "express";
import cors from "cors";
import { client } from "./prisma";
import zod, { number, string, z } from "zod";
import cookieparser from "cookie-parser";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(cookieparser());

// const matrixSchema = zod.object({
//     // date : zod.string().date(),
//     todo : zod.string()
// })

app.get("/CheckMatrix", async (req, res) => {
  const id = req.cookies.id;
  console.log(id);

  try {
    const CheckMatrix = await client.user.findUnique({
      where: { id: id },
    });

    if (CheckMatrix) {
      res.status(302).json({ message: `${CheckMatrix.todo}.` });
    } else {
      res
        .status(404)
        .json({ message: "There's something wrong in finding your matrix." });
    }
  } catch (error) {
    res.status(400).json({ error });
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
  console.log(currentDate);

  const userDate = data.Dates.split("T")[0]; // Extract YYYY-MM-DD from user input
  console.log(userDate);

  try {
    if (currentDate == userDate) {
      const CreatedMatrix = await client.user.create({
        data: {
          Dates: data.Dates,
          todo: data.todo,
        },
      });
      res.cookie("id", CreatedMatrix.id, { maxAge: 90000000, httpOnly: true });

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
