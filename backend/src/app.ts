import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import publicRoutes from "./routes/public"
import privateRoutes from "./routes/private"

const app = express()

app.use(cors({ origin: "http://localhost:5173", credentials: true }))
app.use(cookieParser())
app.use(express.json())

// Mount routes under /api
app.use("/api", publicRoutes)
app.use("/api", privateRoutes)

export default app
