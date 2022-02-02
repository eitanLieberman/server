const router = require("express").Router();
const User = require("../models/user");
const CryptoJS = require("crypto-js");
const Jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
    pic: req.body.pic,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({
      email: req.body.username.trim(),
    });
    if (!user) {
      user = await User.findOne({
        username: req.body.username.trim(),
      });
    }

    if (!user) {
      res.status(401).json("wrong email or password11");
    }
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const passwordO = hashedPassword.toString(CryptoJS.enc.Utf8);

    if (passwordO !== req.body.password) {
      res.status(401).json("wrong email or password2");
    }
    const accessToken = Jwt.sign({ id: user._id }, process.env.JWT_SEC, {
      expiresIn: "3d",
    });
    const { password, ...others } = user._doc;

    return res.status(200).json({ ...others, accessToken });
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

module.exports = router;
