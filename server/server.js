const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const Database = require('better-sqlite3');
require('dotenv').config();

const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// --- SÉCURITÉ ---
app.use(helmet());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// --- BASE DE DONNÉES SQLITE ---
const fs = require('fs');
const path = require('path');

// Dossier pour le stockage persistant (indispensable pour Render/Railway)
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const dbPath = path.join(DATA_DIR, 'database.db');
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    img TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
app.set('db', db);

// --- ROUTES ---
app.use(express.static(path.join(__dirname, '..')));
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Serveur Pure Tech est en ligne avec SQLite 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Serveur démarré avec SQLite`);
    console.log(`🚀 Disponible sur http://localhost:${PORT}`);
});
