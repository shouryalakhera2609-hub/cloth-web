const express = require('express');
const Item = require('../models/Item');
const upload = require('../middleware/upload');
const { uploadBuffer, deleteImage } = require('../config/cloudinary');

const { requireLogin } = require('./auth');
const router = express.Router();

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    res.json(await Item.find().sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item nahi mila' });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items  (multipart/form-data: title, description, image)
router.post('/', requireLogin, upload.single('image'), async (req, res, next) => {
  try {
    const { title, description, category, price, productNumber } = req.body;
    if (!category || !price) return res.status(400).json({ message: 'category and price required hain' });

    const latest = await Item.findOne().sort({ productNumber: -1 }).select('productNumber');
    const nextNumber = productNumber ? Number(productNumber) : (latest?.productNumber || 0) + 1;
    const data = {
      title: title?.trim() || '',
      description: description?.trim() || '',
      category,
      price: Number(price),
      productNumber: nextNumber,
    };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer);
      data.image = { url: result.secure_url, publicId: result.public_id };
    }
    res.status(201).json(await Item.create(data));
  } catch (err) {
    next(err);
  }
});

// PUT /api/items/:id
router.put('/:id', requireLogin, upload.single('image'), async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item nahi mila' });

    if (req.body.title !== undefined) item.title = req.body.title;
    if (req.body.description !== undefined) item.description = req.body.description;
    if (req.body.category !== undefined) item.category = req.body.category;
    if (req.body.price !== undefined) item.price = Number(req.body.price);
    if (req.body.productNumber !== undefined) item.productNumber = Number(req.body.productNumber);

    if (req.file) {
      await deleteImage(item.image?.publicId);
      const result = await uploadBuffer(req.file.buffer);
      item.image = { url: result.secure_url, publicId: result.public_id };
    }
    res.json(await item.save());
  } catch (err) {
    next(err);
  }
});

// DELETE /api/items/:id
router.delete('/:id', requireLogin, async (req, res, next) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item nahi mila' });
    await deleteImage(item.image?.publicId);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
