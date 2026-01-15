import express from "express"
import cors from "cors"
import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import voterRouter from "./routes/voters.routes.js";
import cookieParser from "cookie-parser";
import candidateRouter from "./routes/candidates.routes.js";
import merkleTreeRouter from "./routes/merkleTree.routes.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials:true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], 
  allowedHeaders: ["Authorization", "Content-Type"],
}))


app.use(express.json({ limit:"16kb" })) 
app.use(express.urlencoded({ extended:true, limit:"16kb" })) 
app.use("/images", express.static("public/images"));
app.use(cookieParser()) 

console.log("✅ app.js loaded");

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/voters", voterRouter);
app.use("/api/v1/candidates", candidateRouter);
app.use("/api/v1/merkle-tree", merkleTreeRouter);
app.get('/', (req, res) => {
  res.send("Welcome to my Project")
})


app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
  });
});


export default app;