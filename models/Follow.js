const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FollowSchema = new Schema({
  follower: { type: Schema.ObjectId, ref: "User", required: true },
  followed: { type: Schema.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Follow", FollowSchema);
