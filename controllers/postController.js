const Post = require("../models/Post");
const Like = require("../models/Like");

exports.create_post = async (req, res) => {
  if (req.isAuthenticated()) {
    const post = new Post({
      text: req.body.text,
      author: req.user._id,
      date: new Date(),
    });

    const newPost = await post
      .save()
      .then((res) => res.populate("author", "username"))
      .then((data) => data);

    res.json(newPost);
  } else {
    res.json({ message: "Post creation failed" });
  }
};

exports.get_all_posts = async (req, res) => {
  const posts = await Post.find().lean().populate("author", "username").exec();
  if (req.isAuthenticated()) {
    const likesQuery = await Like.find({ user: req.user._id, post: posts.map((post) => post._id) }).select("post -_id");
    const likes = likesQuery.map((like) => like.post.toString());

    const postsWithLikes = posts.map((post) => {
      return { ...post, userHasLiked: likes.includes(post._id.toString()) };
    });

    res.json(postsWithLikes);
  } else {
    res.json(posts);
  }
};

exports.get_single_post = async (req, res) => {
  if (req.isAuthenticated()) {
    const [post, likeQuery] = await Promise.all([
      Post.findById(req.params.id).populate("author", "username").lean(),
      Like.findOne({ user: req.user._id, post: req.params.id }),
    ]);
    res.json({ ...post, userHasLiked: !!likeQuery });
  } else {
    const post = await Post.findById(req.params.id).populate("author", "username").lean();
    res.json(post);
  }
};

exports.delete_post = async (req, res) => {
  if (req.isAuthenticated()) {
    await Promise.all([Post.findOneAndDelete({ _id: req.params.id, author: req.user._id }), Like.deleteMany({ post: req.params.id })]);
    res.json({ message: "Post Deleted" });
  } else {
    res.json({ message: "Delete failed" });
  }
};
