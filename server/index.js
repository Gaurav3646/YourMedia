import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import chatRoutes from "./routes/chat.js";
import messageRoutes from "./routes/message.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";
import { Server } from "socket.io";

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post("/auth/register", upload.single("picture"), register);
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/messages", messageRoutes);
app.use("/chats", chatRoutes);

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;

const DB = process.env.MONGO_URL.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);
console.log(DB);
(async () => {
  try {
    const conn = await mongoose.connect(DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const server = await app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}...`);
    });

    const io = new Server(server, {
      pingTimeout: 60000,
      cors: {
        origin: "http://localhost:3000",
        // credentials: true,
      },
    });
    var online = [];
    io.on("connection", (socket) => {
      console.log("Connected to socket.io");

      socket.on("setup", (userData) => {
        console.log(userData._id);
        socket.join(userData._id);
        socket.join("abcd");
        socket.emit("connected", userData._id);
        // socket.broadcast.emit("online", userData._id);
      });
      // socket.on("dissconnect", (id) => {
      //   console.log("USER DISCONNECTED");
      //   socket.broadcast.emit("offline", id);
      // });

      socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
      });
      socket.on("leave chat", (room) => {
        socket.leave(room);
        console.log("User Left Room: " + room);
      });

      socket.on("online", (id) => {
        if (!online.includes(id)) {
          online.push(id);
          console.log(online);
          io.to("abcd").emit("online", online);
        }
      });
      socket.on("offline", (id) => {
        var newOnline = online.filter((userId) => userId !== id);
        online = newOnline;
        console.log(online);
        io.to("abcd").emit("offline", online);
      });

      socket.on("typing", (room, id) => io.to(room).emit("typing", id));
      socket.on("stop typing", (room, id) =>
        io.to(room).emit("stop typing", id)
      );

      socket.on("new message", (newMessageReceived) => {
        const chat = newMessageReceived.chat;

        if (!chat || !chat.users) {
          return console.log("chat.users not defined");
        }

        chat.users.forEach((user) => {
          if (user === newMessageReceived.sender._id) return;
          console.log("new Message come in");
          // console.log(user);
          socket.to(user).emit("message received", newMessageReceived);
        });
      });
    });
  } catch (error) {
    console.log(`${error} did not connect`);
    process.exit(1);
  }
})();
