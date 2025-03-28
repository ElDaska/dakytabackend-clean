// middlewares/quota.middleware.js

const UsageStats = require('../models/UsageStats');
const User = require('../models/User');

// Définit les quotas mensuels par rôle
const ROLE_LIMITS = {
  free: {
    iaGenerations: 5,
    pdfAnalyses: 10,
    scrapings: 0
  },
  starter: {
    iaGenerations: Infinity,
    pdfAnalyses: Infinity,
    scrapings: 100
  },
  pro: {
    iaGenerations: Infinity,
    pdfAnalyses: Infinity,
    scrapings: 500
  },
  admin: {
    iaGenerations: Infinity,
    pdfAnalyses: Infinity,
    scrapings: Infinity
  }
};

// Middleware générique : vérifie les quotas selon le type
function checkQuota(type) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Récupère l'utilisateur
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

      const role = user.role;
      const limits = ROLE_LIMITS[role];

      // Récupère les stats actuelles
      const currentMonth = new Date().toISOString().slice(0, 7); // ex: 2025-03
      let stats = await UsageStats.findOne({ user: userId, month: currentMonth });

      if (!stats) {
        stats = await UsageStats.create({ user: userId, month: currentMonth });
      }

      // Vérifie si limite dépassée
      if (limits[type] !== Infinity && stats[type] >= limits[type]) {
        return res.status(403).json({ message: `Quota ${type} mensuel atteint.` });
      }

      // Autorise la suite
      req.usageStats = stats; // on stocke pour incrémenter plus tard
      next();

    } catch (error) {
      console.error("Erreur quota:", error.message);
      res.status(500).json({ message: "Erreur vérification quota." });
    }
  };
}

module.exports = checkQuota;
