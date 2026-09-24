const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function resetPassword() {
    const db = new Database('database.db');
    const newPassword = 'Admin123!'; // LE NOUVEAU MOT DE PASSE

    try {
        console.log('Hachage du mot de passe...');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // On vérifie si une table admin existe, sinon on la crée
        db.exec(`CREATE TABLE IF NOT EXISTS admins (id INTEGER PRIMARY KEY, username TEXT, password TEXT)`);

        // On vérifie s'il y a déjà un admin
        const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get('admin');

        if (admin) {
            db.prepare('UPDATE admins SET password = ? WHERE username = ?').run(hash, 'admin');
            console.log('✅ Mot de passe mis à jour avec succès pour l\'administrateur !');
        } else {
            db.prepare('INSERT INTO admins (username, password) VALUES (?, ?)').run('admin', hash);
            console.log('✅ Administrateur créé et mot de passe défini !');
        }

        console.log('---------------------------------------------------');
        console.log('NOUVEAU MOT DE PASSE : ' + newPassword);
        console.log('---------------------------------------------------');
    } catch (err) {
        console.error('Erreur lors de la réinitialisation :', err);
    } finally {
        db.close();
    }
}

resetPassword();
