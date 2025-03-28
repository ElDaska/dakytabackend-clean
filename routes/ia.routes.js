// routes/ia.routes.js

const express = require('express');
const { OpenAI } = require('openai');
const checkAuth = require('../middlewares/auth.middleware');
const checkQuota = require('../middlewares/quota.middleware');

const router = express.Router();

// Config OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Génération de texte
router.post('/generate/text', checkAuth, checkQuota('iaGenerations'), async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.length < 5) {
      return res.status(400).json({ message: "Prompt invalide." });
    }

    // Appel à GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    });

    const generatedText = completion.choices[0].message.content;

    // Incrémenter le compteur IA
    const stats = req.usageStats;
    stats.iaGenerations += 1;
    await stats.save();

    res.status(200).json({ result: generatedText });

  } catch (error) {
    console.error("Erreur génération IA:", error.message);
    res.status(500).json({ message: "Erreur génération IA." });
  }
});

module.exports = router;
