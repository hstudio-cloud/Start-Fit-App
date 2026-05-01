const app = require('./app');
const connectToDatabase = require('./db');
const { isDemoMode } = require('./demoStore');

const PORT = process.env.PORT || 5000;

Promise.resolve(isDemoMode ? null : connectToDatabase())
  .then(() => {
    console.log(isDemoMode ? 'StartFit API rodando em demo mode' : 'MongoDB conectado');
    app.listen(PORT, () => {
      console.log(`StartFit API rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar MongoDB:', err.message);
    process.exit(1);
  });

module.exports = app;
