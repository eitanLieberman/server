const User = require("../models/user");
const {
  verifyToken,
  verifyTokenAndAuthorize,
  verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();
//changing username
router.put("/:id", verifyTokenAndAuthorize, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});
//deleting user
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET SINGLE USER
router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    // let user = await User.find({
    //   email: req.params.id,
    // });
    // if (!user) {
    // }
    let user = await User.find({
      $or: [
        { email: { $regex: req.params.id, $options: "i" } },
        { username: { $regex: req.params.id, $options: "i" } },
      ],
    });
    // console.log(user);
    const cleanUser = user.map((u) => {
      const { password, ...others } = u._doc;
      u._doc = { ...others };
      console.log(u._doc);
      return others;
    });
    console.log(cleanUser);
    // const { password, ...others } = user._doc;

    res.status(200).json(cleanUser);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
});

//GET ALL USERS
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();

    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
//GET USER STATS- returns number of users created each month current month- i.e : december:1 user, november:2 users

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: { month: { $month: "$createdAt" } },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
