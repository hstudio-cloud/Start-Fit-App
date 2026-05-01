const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Perfil '${req.user.role}' não tem permissão.`,
      });
    }
    next();
  };
};

module.exports = { authorize };
