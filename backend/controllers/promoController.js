const PromoCode = require('../models/PromoCode');

// CREATE PROMO (admin only)
const createPromo = async (req, res) => {
  try {
    const { code, discountType, discountValue, minAmount, maxUses, expiresAt } = req.body;
    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountType, discountValue,
      minAmount: minAmount || 0,
      maxUses: maxUses || 100,
      expiresAt: expiresAt || null,
      createdBy: req.user.id
    });
    res.status(201).json(promo);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Promo code already exists' });
    res.status(500).json({ message: error.message });
  }
};

// GET ALL PROMOS (admin only)
const getPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// VALIDATE PROMO (any logged-in user)
const validatePromo = async (req, res) => {
  try {
    const { code, amount } = req.body;
    if (!code || !amount) return res.status(400).json({ message: 'code and amount are required' });

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) return res.status(404).json({ message: 'Invalid or expired promo code' });
    if (promo.expiresAt && new Date() > promo.expiresAt)
      return res.status(400).json({ message: 'Promo code has expired' });
    if (promo.usedCount >= promo.maxUses)
      return res.status(400).json({ message: 'Promo code usage limit reached' });
    if (amount < promo.minAmount)
      return res.status(400).json({ message: `Minimum order amount ₹${promo.minAmount} required` });

    const discount = promo.discountType === 'percentage'
      ? Math.round(amount * promo.discountValue / 100)
      : Math.min(promo.discountValue, amount);

    res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discount,
      finalAmount: amount - discount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TOGGLE PROMO ACTIVE (admin)
const togglePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) return res.status(404).json({ message: 'Promo not found' });
    promo.isActive = !promo.isActive;
    await promo.save();
    res.json({ message: `Promo ${promo.isActive ? 'activated' : 'deactivated'}`, promo });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE PROMO (admin)
const deletePromo = async (req, res) => {
  try {
    await PromoCode.findByIdAndDelete(req.params.id);
    res.json({ message: 'Promo deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPromo, getPromos, validatePromo, togglePromo, deletePromo };
