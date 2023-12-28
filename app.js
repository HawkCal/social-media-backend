require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongodb-session")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const indexRouter = require("./routes/index");
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const likeRouter = require("./routes/likeRouter");

mongoConnect();
async function mongoConnect() {
  await mongoose.connect(process.env.MONGO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  console.log("Connected to mongoDb");
}

const store = new mongoStore({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

const app = express();
const corsOptions = {
  origin: ["https://simple-social-media-app-drab.vercel.app", "http://localhost:5173"],
  exposedHeaders: ["set-cookie"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET, store: store, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      console.log("Authenticating");
      const user = await User.findOne({ username: username });

      if (!user) return done(null, false, { message: "User not found." });

      bcrypt.compare(password, user.password, (err, res) => {
        if (err) return done(err);
        if (res) return done(null, user);
        return done(null, false, { message: "Incorrect password." });
      });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  console.log("Serializing");
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log("Deserializing");
    const user = await User.findById(id);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

app.use("/", indexRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use("/likes", likeRouter);

app.listen(8080, () => {
  console.log("App listening on port 8080");
});
