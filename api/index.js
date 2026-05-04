const app = require('../backend/app');
const connectToDatabase = require('../backend/db');
const { isDemoMode } = require('../backend/demoStore');

module.exports = async (req, res) => {
  if (!isDemoMode) {
    await connectToDatabase();
  }
  return app(req, res);
};
