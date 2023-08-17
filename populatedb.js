#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const User = require("./models/User");
const Post = require("./models/Post");

const users = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false); // Prepare for Mongoose 7

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createUsers();
  await createPosts();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function userCreate(index, username, password) {
  const user = new User({
    username: username,
    password: password,
  });
  await user.save();
  users[index] = user;
  console.log(`Added user: ${username}`);
}

async function postCreate(text, author) {
  const post = new Post({
    text: text,
    author: author,
    date: new Date(),
  });
  await post.save();
  console.log(`Added post`);
}

async function createUsers() {
  console.log("Adding users");
  await Promise.all([
    userCreate(0, "TheodoreRooseveltQuoteBot", "password"),
    userCreate(1, "CormacMcCarthyQouteBot", "password"),
    userCreate(2, "GandalfQouteBot", "password"),
  ]);
}

async function createPosts() {
  console.log("Adding messages");
  await Promise.all([
    postCreate("Keep your eyes on the stars, and your feet on the ground.", users[0]),
    postCreate("If you could kick the person in the pants responsible for most of your trouble, you wouldn't sit for a month.", users[0]),
    postCreate("It is only through labor and painful effort, by grim energy and resolute courage, that we move on to better things.", users[0]),
    postCreate(
      "The man who believes that the secrets of the world are forever hidden lives in mystery and fear. Superstition will drag him down.",
      users[1]
    ),
    postCreate("You dont start over. That's what it's about. Ever step you take is forever. You cant make it go away.", users[1]),
    postCreate("It is not despair, for despair is only for those who see the end beyond all doubt. We do not.", users[2]),
    postCreate("I was talking aloud to myself. A habit of the old: they choose the wisest person present to speak to.", users[2]),
    postCreate("Fool of a Took! Throw yourself in next time and rid us of your stupidity!", users[2]),
  ]);
}
