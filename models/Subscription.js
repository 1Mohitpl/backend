const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a subscription name'],
    trim: true
  },
  cost: {
    type: Number,
    required: [true, 'Please provide the cost'],
    min: 0
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    required: true,
    default: 'monthly'
  },
  renewalDate: {
    type: Date,
    required: false
  },
  category: {
    type: String,
    enum: ['entertainment', 'productivity', 'fitness', 'education', 'music', 'news', 'cloud', 'other'],
    default: 'other'
  },
  color: {
    type: String,
    default: '#6366f1',
    match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field to calculate monthly cost (for yearly subscriptions)
subscriptionSchema.virtual('monthlyCost').get(function() {
  if (this.billingCycle === 'yearly') {
    return this.cost / 12;
  }
  return this.cost;
});

// Include virtuals when converting to JSON
subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
