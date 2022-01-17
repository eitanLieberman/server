const Jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.token;

  if (authHeader) {
    const token = authHeader.split(" ")[1];

    Jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json("Token invalid");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("you are not authenticated");
  }
};

const verifyTokenAndAuthorize = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("you are not authorized!");
    }
  });
};

const verifyTokenAndAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    console.log(req);
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("you are not authorized admin!");
    }
  });
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenAndAdmin,
};
