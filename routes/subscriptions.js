const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const auth = require('../middleware/auth');

// @route   GET /api/subscriptions
// @desc    Get all subscriptions for logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      user: req.userId,
      isActive: true 
    }).sort({ createdAt: -1 });

    // Calculate totals
    const totals = subscriptions.reduce((acc, sub) => {
      const monthlyCost = sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost;
      acc.monthly += monthlyCost;
      acc.yearly += monthlyCost * 12;
      return acc;
    }, { monthly: 0, yearly: 0 });

    res.json({
      success: true,
      count: subscriptions.length,
      subscriptions,
      totals: {
        monthly: parseFloat(totals.monthly.toFixed(2)),
        yearly: parseFloat(totals.yearly.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get single subscription
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      _id: req.params.id,
      user: req.userId
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', [
  auth,
  body('name').trim().notEmpty().withMessage('Subscription name is required'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('billingCycle').isIn(['monthly', 'yearly']).withMessage('Billing cycle must be monthly or yearly'),
  body('category').optional().isIn(['entertainment', 'productivity', 'fitness', 'education', 'music', 'news', 'cloud', 'other'])
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const subscription = new Subscription({
      ...req.body,
      user: req.userId
    });

    await subscription.save();

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
// @access  Private
router.put('/:id', [
  auth,
  body('name').optional().trim().notEmpty(),
  body('cost').optional().isFloat({ min: 0 }),
  body('billingCycle').optional().isIn(['monthly', 'yearly']),
  body('category').optional().isIn(['entertainment', 'productivity', 'fitness', 'education', 'music', 'news', 'cloud', 'other'])
], async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Delete subscription (soft delete)
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isActive: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// @route   GET /api/subscriptions/stats/overview
// @desc    Get subscription statistics and insights
// @access  Private
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ 
      user: req.userId,
      isActive: true 
    });

    // Calculate category breakdown
    const categoryBreakdown = subscriptions.reduce((acc, sub) => {
      const monthlyCost = sub.billingCycle === 'yearly' ? sub.cost / 12 : sub.cost;
      acc[sub.category] = (acc[sub.category] || 0) + monthlyCost;
      return acc;
    }, {});

    // Find upcoming renewals (next 30 days)
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingRenewals = subscriptions
      .filter(sub => sub.renewalDate && new Date(sub.renewalDate) <= thirtyDaysLater)
      .sort((a, b) => new Date(a.renewalDate) - new Date(b.renewalDate))
      .slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalSubscriptions: subscriptions.length,
        categoryBreakdown,
        upcomingRenewals: upcomingRenewals.map(sub => ({
          id: sub._id,
          name: sub.name,
          renewalDate: sub.renewalDate,
          cost: sub.cost,
          billingCycle: sub.billingCycle
        }))
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;
