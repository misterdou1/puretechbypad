const express = require('express');
const router = express.Router();

// @route   GET /api/products
// @desc    Récupérer tous les produits
router.get('/', (req, res) => {
    try {
        const db = req.app.get('db');
        const stmt = db.prepare('SELECT * FROM products ORDER BY createdAt DESC');
        const products = stmt.all();
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur lors de la récupération' });
    }
});

// @route   POST /api/products
// @desc    Ajouter un produit
router.post('/', (req, res) => {
    try {
        const { name, category, price, img } = req.body;
        const db = req.app.get('db');
        const stmt = db.prepare('INSERT INTO products (name, category, price, img) VALUES (?, ?, ?, ?)');
        const info = stmt.run(name, category, price, img);
        res.status(201).json({ id: info.lastInsertRowid, name, category, price, img });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit
router.delete('/:id', (req, res) => {
    try {
        const db = req.app.get('db');
        const stmt = db.prepare('DELETE FROM products WHERE id = ?');
        stmt.run(req.params.id);
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la suppression' });
    }
});

module.exports = router;
