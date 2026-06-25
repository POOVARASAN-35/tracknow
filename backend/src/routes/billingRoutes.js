const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Transaction = require('../models/Transaction');
const Refund = require('../models/Refund');
const CustomerWallet = require('../models/CustomerWallet');
const PaymentMethod = require('../models/PaymentMethod');
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const SupportTicket = require('../models/SupportTicket');
const { sendToUser } = require('../config/socket');

// All billing endpoints require authentication
router.use(protect);

// 1. GET Billing Summary
router.get('/summary', async (req, res) => {
  try {
    const customerId = req.user._id;

    const invoices = await Invoice.find({ customer: customerId });
    const orders = await Order.find({ customer: customerId });
    const refunds = await Refund.find({ customer: customerId });
    const wallet = await CustomerWallet.findOne({ customer: customerId }) || { balance: 0, cashback: 0 };
    const savedMethodsCount = await PaymentMethod.countDocuments({ customer: customerId });

    // Calculate spend aggregates
    const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
    const totalSpent = paidInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const successfulCount = paidInvoices.length;
    const pendingCount = invoices.filter(inv => inv.status === 'Pending').length;
    const failedCount = invoices.filter(inv => inv.status === 'Failed').length;
    const refundAmount = refunds.filter(r => r.status === 'Success').reduce((sum, r) => sum + r.amount, 0);

    // Static trends/percentages for visuals
    const summary = {
      totalSpent: { amount: totalSpent, pctChange: '+12.4%', label: 'Total Amount Spent' },
      totalOrders: { amount: orders.length, pctChange: '+8.2%', label: 'Total Orders Placed' },
      successfulPayments: { amount: successfulCount, pctChange: '+14.1%', label: 'Successful Payments' },
      pendingPayments: { amount: pendingCount, pctChange: '-5.0%', label: 'Pending Payments' },
      failedPayments: { amount: failedCount, pctChange: '-15.8%', label: 'Failed Payments' },
      refundAmount: { amount: refundAmount, pctChange: '+4.3%', label: 'Refund Amount' },
      rewardCashback: { amount: wallet.cashback || 0, pctChange: '+18.5%', label: 'Reward Cashback' },
      savedPaymentMethods: { amount: savedMethodsCount, pctChange: '+1', label: 'Saved Payment Methods' }
    };

    res.status(200).json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET Invoices List
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find({ customer: req.user._id })
      .populate('order')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: invoices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. GET Transactions List
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find({ customer: req.user._id })
      .populate('invoice')
      .sort({ date: -1 });
    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. GET Refunds List
router.get('/refunds', async (req, res) => {
  try {
    const refunds = await Refund.find({ customer: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: refunds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. GET/POST Payment Methods
router.route('/payment-methods')
  .get(async (req, res) => {
    try {
      const methods = await PaymentMethod.find({ customer: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
      res.status(200).json({ success: true, data: methods });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  })
  .post(async (req, res) => {
    try {
      const { type, details } = req.body;
      
      // If setting as default, clear others
      const isDefault = req.body.isDefault || false;
      if (isDefault) {
        await PaymentMethod.updateMany({ customer: req.user._id }, { isDefault: false });
      }

      // Check if it's the first card
      const count = await PaymentMethod.countDocuments({ customer: req.user._id });
      const makeDefault = count === 0 ? true : isDefault;

      const newMethod = await PaymentMethod.create({
        customer: req.user._id,
        type,
        details,
        isDefault: makeDefault
      });

      res.status(201).json({ success: true, data: newMethod });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

// Set default card
router.put('/payment-methods/:id/default', async (req, res) => {
  try {
    await PaymentMethod.updateMany({ customer: req.user._id }, { isDefault: false });
    const updated = await PaymentMethod.findOneAndUpdate(
      { _id: req.params.id, customer: req.user._id },
      { isDefault: true },
      { new: true }
    );
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete card
router.delete('/payment-methods/:id', async (req, res) => {
  try {
    const deleted = await PaymentMethod.findOneAndDelete({ _id: req.params.id, customer: req.user._id });
    if (deleted && deleted.isDefault) {
      // Set another one default
      const another = await PaymentMethod.findOne({ customer: req.user._id });
      if (another) {
        another.isDefault = true;
        await another.save();
      }
    }
    res.status(200).json({ success: true, message: 'Payment method removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. GET Wallet Info
router.get('/wallet', async (req, res) => {
  try {
    let wallet = await CustomerWallet.findOne({ customer: req.user._id });
    if (!wallet) {
      wallet = await CustomerWallet.create({
        customer: req.user._id,
        balance: 150.00,
        cashback: 25.50,
        history: [
          { type: 'credit', amount: 25.50, description: 'Welcome Cashback Reward', date: new Date() }
        ]
      });
    }
    res.status(200).json({ success: true, data: wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. POST Raise Payment Dispute/Issue
router.post('/raise-issue', async (req, res) => {
  try {
    const { subject, description } = req.body;
    const ticket = await SupportTicket.create({
      name: req.user.name,
      email: req.user.email,
      subject: `[Billing Issue] ${subject}`,
      description,
      status: 'open',
      category: 'Customer Complaint'
    });

    // Push live Socket.io alert to the client to confirm ticket reception
    const notifData = {
      title: 'Dispute Ticket Filed',
      message: `Your payment dispute ticket has been registered. ID: ${ticket._id.toString().slice(-6).toUpperCase()}`,
      type: 'coupon_applied',
      timestamp: new Date()
    };
    sendToUser(req.user._id, 'notification', notifData);

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
