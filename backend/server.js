const app = require('./app');
const connectToDatabase = require('./db');

const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`StartFit API rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
