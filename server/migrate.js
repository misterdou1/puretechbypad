const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Connexion à la base de données
const db = new Database('database.db');

// Chemin vers le fichier products.js
const productsPath = path.join(__dirname, '..', 'puretec', 'Js', 'products.js');

try {
    console.log('🚀 Début de la migration des produits...');

    // Lecture du fichier products.js
    let content = fs.readFileSync(productsPath, 'utf8');

    // On extrait uniquement le tableau des produits (entre [ et ])
    const match = content.match(/\[[\s\S]*?\]/);
    if (!match) throw new Error('Impossible de trouver le tableau des produits dans products.js');

    // On transforme le texte en objet JavaScript utilisable
    // Note: on utilise eval ici car le fichier est un format JS et non JSON
    const products = eval(match[0]);

    console.log(`📦 ${products.length} produits trouvés. Insertion en cours...`);

    const insert = db.prepare('INSERT INTO products (name, category, price, img) VALUES (?, ?, ?, ?)');

    // On utilise une transaction pour que ce soit ultra rapide
    const transaction = db.transaction((prods) => {
        for (const p of prods) {
            insert.run(p.name, p.category, p.price, p.img);
        }
    });

    transaction(products);
    console.log('✅ Migration terminée avec succès ! Tous les produits sont maintenant dans database.db');

} catch (err) {
    console.error('❌ Erreur lors de la migration:', err.message);
}
