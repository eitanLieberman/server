const mongoose = require("mongoose");

const userModel = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    pic: {
      type: String,
      required: false,
      default:
        "https://i.pinimg.com/564x/4d/77/e2/4d77e2ffb4b616928c6242b94f6cfefd.jpg",
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userModel);
module.exports = User;
