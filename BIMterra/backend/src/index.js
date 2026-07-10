// Entrypoint para desarrollo local. En Vercel, la función serverless en
// api/index.js importa la misma app de Express (src/app.js) directamente,
// sin pasar por app.listen().
const app = require("./app");

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ BIMterra API corriendo en http://localhost:${PORT}`);
});
