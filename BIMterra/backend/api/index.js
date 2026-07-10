// Vercel detecta este archivo por su ubicación en /api y lo despliega como
// una función serverless. Una app de Express es en sí misma una función
// (req, res) => {}, así que exportarla directamente funciona como handler.
const app = require("../src/app");

module.exports = app;
