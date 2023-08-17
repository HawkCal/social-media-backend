const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
  post: { type: Schema.ObjectId, ref: "Post", required: true },
  user: { type: Schema.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Like", LikeSchema);
