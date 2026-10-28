require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/items');
const authRoutes = require('./routes/auth').router;
const session = require('./config/session');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(session);

app.use('/api/auth', authRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/items', itemRoutes);

// Frontend (plain HTML/CSS/JS) ko backend se hi serve karo
app.use(express.static(path.join(__dirname, '../../frontend')));

// 404 + error handler
app.use((req, res) => res.status(404).json({ message: 'Route nahi mila' }));
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.name === 'MulterError' ? 400 : err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Startup failed:', err.message);
    process.exit(1);
  });
