// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const apiRouter = require('./routes');

const app = express();

const allowed = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowed }));
app.use(express.json());
app.use(morgan('dev'));

// rota saúde
app.get('/', (req, res) => res.json({ ok: true, name: 'harmony-maestro-backend', env: process.env.NODE_ENV || 'dev' }));

// montar API
app.use('/api', apiRouter);

// tratamento simples de erro
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
