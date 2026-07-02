const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['snack', 'drink', 'combo', 'dessert'],
    default: 'snack'
  },
  image: String,
  isAvailable: { type: Boolean, default: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: 'Theatre' }
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);
