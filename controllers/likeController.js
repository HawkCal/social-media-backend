const Like = require("../models/Like");
const Post = require("../models/Post");

exports.create_like = async (req, res) => {
  if (req.isAuthenticated()) {
    const post = await Post.findById(req.body.post).populate("author", "username").exec();
    post.likeCount++;

    const like = new Like({
      post: req.body.post,
      user: req.body.user,
    });

    let updatedPost;
    await Promise.all([post.save(), like.save()]).then((values) => {
      updatedPost = values[0].toObject();
    });

    res.json({ ...updatedPost, userHasLiked: true });
  } else {
    res.json({ message: "Like failed: Authentication error." });
  }
};

exports.remove_like = async (req, res) => {
  if (req.isAuthenticated()) {
    const [post, like] = await Promise.all([
      Post.findById(req.body.post).populate("author", "username"),
      Like.deleteOne({ post: req.body.post, user: req.body.user }),
    ]);
    post.likeCount--;

    const updatedPost = (await post.save()).toObject();
    res.json({ ...updatedPost, userHasLiked: false });
  } else {
    res.json({ message: "Remove like failed: Authentication error." });
  }
};
