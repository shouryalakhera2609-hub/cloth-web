const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    category: { type: String, trim: true, lowercase: true, required: true },
    productNumber: { type: Number, unique: true, required: true },
    price: { type: Number, min: 0, required: true },
    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
