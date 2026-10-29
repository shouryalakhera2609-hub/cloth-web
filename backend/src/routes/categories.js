const express = require('express');
const Category = require('../models/Category');
const { requireLogin } = require('./auth');

const router = express.Router();
const DEFAULT_CATEGORIES = ['saree', 'blouse', 'kurta'];

function categorySlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);
}

async function ensureDefaultCategories() {
  for (const name of DEFAULT_CATEGORIES) {
    await Category.updateOne(
      { slug: name },
      { $setOnInsert: { name: name[0].toUpperCase() + name.slice(1), slug: name } },
      { upsert: true }
    );
  }
}

router.get('/', async (req, res, next) => {
  try {
    await ensureDefaultCategories();
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

router.post('/', requireLogin, async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const slug = categorySlug(name);
    if (!name) return res.status(400).json({ message: 'Category name required hai' });
    if (!slug) return res.status(400).json({ message: 'Valid category name enter karein' });

    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json({ message: 'Category already exists hai' });

    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
