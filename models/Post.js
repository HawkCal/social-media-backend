const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  text: { type: String, required: true },
  author: { type: Schema.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  parent: { type: Schema.ObjectId, ref: "Post" },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
});

module.exports = mongoose.model("Post", PostSchema);
