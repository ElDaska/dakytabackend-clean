const express = require('express');
const axios = require('axios');
const checkAuth = require('../middlewares/auth.middleware');

const router = express.Router();

// Route : Init paiement PayDunya
router.post('/paydunya/init', checkAuth, async (req, res) => {
  try {
    const { plan } = req.body;

    const prices = {
      starter: 4990,
      pro: 9990
    };

    if (!prices[plan]) {
      return res.status(400).json({ message: "Plan invalide." });
    }

    // 1. Préparation des données de facture
    const invoiceData = {
      invoice: {
        items: [
          {
            name: `Abonnement Dakyta - Offre ${plan.toUpperCase()}`,
            quantity: 1,
            unit_price: String(prices[plan]),
            total_price: String(prices[plan]),
            description: "Accès illimité à l’IA de Dakyta"
          }
        ],
        total_amount: String(prices[plan]),
        description: "Paiement de l’abonnement Dakyta"
      },
      store: {
        name: "Dakyta",
        tagline: "L'IA au service des entrepreneurs",
        postal_address: "Dakar, Sénégal",
        phone: "771234567",
        logo_url: "https://www.dakyta.com/logo.png"
      },
      actions: {
        cancel_url: "https://dakytabackend.com/abonnement?cancel=true",
        return_url: "https://dakytabackend.com/abonnement?success=true",
        callback_url: "https://dakytabackend.com/api/payment/paydunya/ipn"
      },
      custom_data: {
        userId: req.user.id,
        plan: plan
      }
    };

    // 2. Requête vers l’API PayDunya
    const response = await axios.post(
      'https://app.paydunya.com/sandbox-api/v1/checkout-invoice/create',
      invoiceData,
      {
        headers: {
          'Content-Type': 'application/json',
          'PAYDUNYA-MASTER-KEY': process.env.PAYDUNYA_MASTER_KEY,
          'PAYDUNYA-PRIVATE-KEY': process.env.PAYDUNYA_PRIVATE_KEY,
          'PAYDUNYA-PUBLIC-KEY': process.env.PAYDUNYA_PUBLIC_KEY,
          'PAYDUNYA-TOKEN': process.env.PAYDUNYA_TOKEN
        }
      }
    );

    if (response.data && response.data.response_code === "00") {
      return res.status(200).json({ redirect_url: response.data.response_text });
    } else {
      return res.status(500).json({ message: "Erreur PayDunya", details: response.data });
    }

  } catch (error) {
    console.error("Erreur PayDunya:", error.message);
    res.status(500).json({ message: "Erreur serveur paiement PayDunya." });
  }
});

const User = require('../models/User');

router.post('/paydunya/ipn', async (req, res) => {
  try {
    const payload = req.body;

    console.log("📬 IPN reçu de PayDunya :", payload);

    const { custom_data, status, total_amount } = payload;

    if (status !== "completed") {
      return res.status(200).send("Paiement non confirmé, pas de mise à jour.");
    }

    const userId = custom_data?.userId;
    const plan = custom_data?.plan;

    if (!userId || !plan) {
      return res.status(400).json({ message: "Données manquantes dans le callback." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable." });

    // Définir la durée d’abonnement : 1 mois
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    // Mise à jour
    user.role = plan;
    user.subscription = {
      plan: plan,
      startDate: now,
      endDate: nextMonth
    };

    await user.save();

    res.status(200).send("Abonnement mis à jour avec succès");

  } catch (err) {
    console.error("❌ Erreur IPN:", err.message);
    res.status(500).send("Erreur serveur IPN.");
  }
});

module.exports = router;
