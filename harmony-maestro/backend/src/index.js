import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import path from "path";
import { fileURLToPath } from "url";

import calendarRoutes from "./routes/calendar.js";
import dashboardRoutes from "./routes/dashboard.js";
import bibliotecaRoutes from "./routes/biblioteca.js";
import seriesRoutes from "./routes/series.js";
import registerRoutes from "./routes/register.js";
import loginRoutes from "./routes/login.js";
import usersRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Config para servir uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Expor pasta uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Teste simples
app.get("/", (req, res) => {
  res.send("Backend rodando com Prisma 🚀");
});

// Exemplo: listar usuários
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// Rotas
app.use("/api", calendarRoutes);

app.use("/api", dashboardRoutes);

app.use("/api", bibliotecaRoutes);

app.use("/api", seriesRoutes);

app.use("/api", registerRoutes);

app.use("/api", loginRoutes);

app.use("/api", usersRoutes);


// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
}); 
