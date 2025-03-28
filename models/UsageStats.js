// models/UsageStats.js

const mongoose = require('mongoose');

const usageStatsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  iaGenerations: {
    type: Number,
    default: 0
  },
  pdfAnalyses: {
    type: Number,
    default: 0
  },
  scrapings: {
    type: Number,
    default: 0
  },
  month: {
    type: String, // ex: "2025-03"
    required: true
  },
  resetDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setMonth(date.getMonth() + 1);
      return date;
    }
  }
});

module.exports = mongoose.model('UsageStats', usageStatsSchema);
