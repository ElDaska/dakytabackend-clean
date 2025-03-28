const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  // Debug : affiche ce que le header contient
  console.log("🛡️ Header Authorization reçu :", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Accès refusé. Aucun token fourni." });
  }

  const token = authHeader.split(' ')[1]; // Sépare "Bearer" et le vrai token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("❌ Token invalide :", err.message);
    return res.status(403).json({ message: "Token invalide ou expiré." });
  }
}

module.exports = checkAuth;
