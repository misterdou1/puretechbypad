const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'puretech_secret_key_123';

// Route de connexion
router.post('/login', async (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const db = req.app.get('db');

    try {
        // 1. Vérification via le fichier .env (méthode rapide)
        if (password === adminPassword) {
            const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
            return res.json({ token });
        }

        // 2. Vérification via la base de données (méthode sécurisée bcrypt)
        const admin = db.prepare('SELECT password FROM admins WHERE username = ?').get('admin');
        if (admin && await bcrypt.compare(password, admin.password)) {
            const token = jwt.sign({ role: 'admin' }, SECRET_KEY, { expiresIn: '2h' });
            return res.json({ token });
        }

        res.status(401).json({ message: 'Mot de passe incorrect' });
    } catch (err) {
        console.error('Erreur login:', err);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
});

module.exports = router;
