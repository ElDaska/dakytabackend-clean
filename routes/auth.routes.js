// routes/auth.routes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Vérifier que tous les champs sont remplis
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Tous les champs sont obligatoires." });
    }

    // 2. Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà." });
    }

    // 3. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Créer le nouvel utilisateur (rôle par défaut = "free")
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
// Gestion des stats d'utilisation
// Créer un document UsageStats pour le nouvel utilisateur
    const UsageStats = require('../models/UsageStats');

const currentMonth = new Date().toISOString().slice(0, 7); // ex: "2025-03"

await UsageStats.create({
  user: newUser._id,
  month: currentMonth
});


    // 5. Créer un token JWT
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 6. Envoyer réponse
    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    });

  } catch (error) {
    console.error("Erreur register:", error.message);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription." });
  }
});
// LOGIN
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // 1. Vérifie que les champs sont remplis
      if (!email || !password) {
        return res.status(400).json({ message: "Email et mot de passe requis." });
      }
  
      // 2. Vérifie si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Utilisateur introuvable." });
      }
  
      // 3. Compare le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mot de passe incorrect." });
      }
  
      // 4. Génère un token
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
  
      // 5. Réponse
      res.status(200).json({
        message: "Connexion réussie",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      });
  
    } catch (error) {
      console.error("Erreur login:", error.message);
      res.status(500).json({ message: "Erreur serveur lors de la connexion." });
    }
  });
  
module.exports = router;
