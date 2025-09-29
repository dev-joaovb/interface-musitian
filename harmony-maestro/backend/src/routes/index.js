const express = require("express");
const router = express.Router();
//const pool = require("../db");  Depois  configurar o banco

// Teste de rota
router.get("/", (req, res) => {
  res.json({ message: "API do Harmony Maestro funcionando 🎵" });
});

// // Teste de banco
// router.get("/users", async (req, res) => {
//   try {
//     const result = await pool.query("SELECT NOW()");
//     res.json({ db_time: result.rows[0] });
//   } catch (err) {
//     res.status(500).json({ error: "Erro no banco", details: err });
//   }
// });

module.exports = router;
