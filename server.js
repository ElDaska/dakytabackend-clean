// server.js

// 🔹 Imports principaux
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// 🔹 Chargement des variables d'environnement
dotenv.config();

// 🔹 Initialisation de l'app
const app = express();

// 🔹 Middlewares globaux
app.use(cors());
app.use(express.json());

// 🔹 Connexion MongoDB
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connecté avec succès');
    app.listen(PORT, () => {
      console.log(`✅ Serveur en écoute sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur connexion MongoDB :', err.message);
  });

// 🔹 Importation des routes
const authRoutes = require('./routes/auth.routes');
const iaRoutes = require('./routes/ia.routes');
const paymentRoutes = require('./routes/payment.routes');

// 🔹 Utilisation des routes
app.use('/api/auth', authRoutes);         // Authentification
app.use('/api/ia', iaRoutes);             // Génération IA
app.use('/api/payment', paymentRoutes);   // Paiement (PayDunya)

// 🔹 Route de test
app.get('/', (req, res) => {
  res.send('🚀 Dakyta backend is running');
});
