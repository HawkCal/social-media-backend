const passport = require("passport");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Post = require("../models/Post");
const Like = require("../models/Like");

exports.create_user = (req, res, next) => {
  bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
    if (err) return next(err);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    await newUser.save();

    passport.authenticate("local", function (err, user) {
      if (err) return next(err);

      req.login(user, function (err) {
        res.json({ _id: user._id, username: user.username });
      });
    })(req, res, next);
  });
};

exports.delete_user = async (req, res, next) => {
  if (req.isAuthenticated()) {
    let postIds;
    let likedPosts;
    //Get users created posts and liked posts
    await Promise.all([Post.find({ author: req.params.id }), Like.find({ user: req.params.id })]).then((values) => {
      postIds = values[0].map((post) => post._id);
      likedPosts = values[1].map((like) => like.post);
    });

    //reduce the likeCount on users liked posts by 1
    //delete users created posts
    //delete likes created by user and likes on users created posts
    //delete user
    await Promise.all([
      Post.updateMany({ _id: { $in: likedPosts } }, { $inc: { likeCount: -1 } }),
      Post.deleteMany({ author: req.params.id }),
      Like.deleteMany({ $or: [{ user: req.params.id }, { post: { $in: postIds } }] }),
      User.findByIdAndDelete(req.params.id),
    ]);

    //log out of session
    req.logOut((err) => {
      if (err) return next(err);
      res.json({ message: "User deleted" });
    });
  } else {
    res.json({ message: "Delete user failed: Authentication error" });
  }
};

exports.sign_in_user = (req, res, next) => {
  passport.authenticate("local", function (err, user) {
    if (err) return next(err);

    req.login(user, function (err) {
      res.json({ _id: user._id, username: user.username });
    });
  })(req, res, next);
};

exports.get_user = async (req, res) => {
  const user = await User.findById(req.params.id, { password: 0 });
  res.json(user);
};

exports.get_user_posts = async (req, res) => {
  const posts = await Post.find({ author: req.params.id }).lean();
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

exports.get_user_likes = async (req, res) => {
  const likedPosts = await Like.find({ user: req.params.id })
    .populate({ path: "post", populate: { path: "author", select: "username" } })
    .select("-_id -user")
    .lean()
    .exec();

  if (req.isAuthenticated()) {
    const likesQuery = await Like.find({ user: req.user._id, post: likedPosts.map((obj) => obj.post._id) }).select("post -_id");
    const likes = likesQuery.map((like) => like.post.toString());

    const postsWithLikes = likedPosts.map((obj) => {
      return { ...obj.post, userHasLiked: likes.includes(obj.post._id.toString()) };
    });

    res.json(postsWithLikes);
  } else {
    res.json(likedPosts.map((obj) => obj.post));
  }
};

exports.check_auth_status = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.json({ _id: req.user._id, username: req.user.username });
  } else {
    res.json(null);
  }
};

exports.sign_out_user = async (req, res, next) => {
  if (req.isAuthenticated()) {
    req.logOut((err) => {
      if (err) return next(err);
      res.json({ message: "User signed out" });
    });
  } else {
    res.json({ message: "Sign out user failed: Authentication error" });
  }
};
