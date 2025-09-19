const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config(); 

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const requestRoutes = require("./routes/requests");

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/requests", requestRoutes);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected!"))
.catch(err => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => res.send("Collegio Running!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
