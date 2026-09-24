const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Le nom du produit est obligatoire'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'La catégorie est obligatoire'],
        enum: ['smartphone', 'audio', 'accessoire', 'tablette', 'googlepixel', 'ordinateur']
    },
    price: {
        type: Number,
        required: [true, 'Le prix est obligatoire'],
        min: [0, 'Le prix ne peut pas être négatif']
    },
    img: {
        type: String,
        required: [true, 'L\'image est obligatoire']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Product', productSchema);
