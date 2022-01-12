const mongoose = require("mongoose");

const chatModel = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    pic: {
      type: String,
      required: true,
      default:
        "https://i.pinimg.com/564x/4d/77/e2/4d77e2ffb4b616928c6242b94f6cfefd.jpg",
    },
  },
  { timestamps: true }
);
