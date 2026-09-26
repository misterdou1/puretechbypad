const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CONFIGURATION JSONBIN
const BIN_ID = '6ab71637ffd5d160532fdcec';
const API_KEY = '$2a$10$4Fs07Nlbqy7BaMKaIAsbteg7HnpFaI57gfTQxEhTcJSFGytHpyRo6';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

app.use(cors());
app.use(express.json());

// Fonction pour appeler JSONBin
async function callJsonBin(method, body = null) {
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': API_KEY
        }
    };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(JSONBIN_URL, options);
    const result = await response.json();

    // JSONBin renvoie les données dans un objet "record"
    return result.record;
}

// --- ROUTES API ---

// Obtenir tous les produits
app.get('/api/products', async (req, res) => {
    try {
        const products = await callJsonBin('GET');
        res.json(products);
    } catch (err) {
        console.error('Erreur JSONBin:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération des produits' });
    }
});

// Ajouter un produit
app.post('/api/products', async (req, res) => {
    try {
        const products = await callJsonBin('GET');
        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
            ...req.body
        };
        products.push(newProduct);
        await callJsonBin('PUT', products);
        res.json(newProduct);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de l\'ajout du produit' });
    }
});

// Modifier un produit
app.put('/api/products/:id', async (req, res) => {
    try {
        const products = await callJsonBin('GET');
        const index = products.findIndex(p => p.id === parseInt(req.params.id));
        if (index === -1) return res.status(404).json({ error: 'Produit non trouvé' });

        products[index] = { ...products[index], ...req.body };
        await callJsonBin('PUT', products);
        res.json(products[index]);
    } catch (err) {
        res.status(400).json({ error: 'Erreur lors de la mise à jour' });
    }
});

// Supprimer un produit
app.delete('/api/products/:id', async (req, res) => {
    try {
        const products = await callJsonBin('GET');
        const filteredProducts = products.filter(p => p.id !== parseInt(req.params.id));
        await callJsonBin('PUT', filteredProducts);
        res.json({ message: 'Produit supprimé avec succès' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 SERVEUR CLOUD JSONBIN ACTIF sur le port ${PORT}`);
});