const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5000;
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

app.use(cors());
app.use(express.json());

// Route principale pour les produits (compatible avec le site et l'admin)
app.get('/api/products', (req, res) => {
    fs.readFile(PRODUCTS_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error("Erreur lecture fichier:", err);
            return res.status(500).json({ error: 'Erreur lecture fichier' });
        }
        try {
            const products = JSON.parse(data);
            res.json(products);
        } catch (e) {
            res.status(500).json({ error: 'Erreur format JSON' });
        }
    });
});

// Ajouter un produit
app.post('/api/products', (req, res) => {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    const products = JSON.parse(data);
    const newProduct = {
        id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
        ...req.body
    };
    products.push(newProduct);
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.json(newProduct);
});

// Modifier un produit
app.put('/api/products/:id', (req, res) => {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    let products = JSON.parse(data);
    const index = products.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Produit non trouvé' });

    products[index] = { ...products[index], ...req.body };
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.json(products[index]);
});

// Supprimer un produit
app.delete('/api/products/:id', (req, res) => {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    let products = JSON.parse(data);
    products = products.filter(p => p.id !== parseInt(req.params.id));
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    res.json({ message: 'Produit supprimé' });
});

app.listen(PORT, () => {
    console.log(`🚀 SERVEUR SIMPLE ACTIF sur http://localhost:${PORT}`);
    console.log(`Lien des produits: http://localhost:${PORT}/api/products`);
});