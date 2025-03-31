const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ createdAt: 1 }, { expireAfterSeconds: 3000 });

const Session = mongoose.model("Session", schema);
module.exports = Session;
