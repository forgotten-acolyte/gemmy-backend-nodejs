const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
    });
    //check username exist or not
    User.findOne({ username: req.body.username }).then((username) => {
      if (username) {
        res.status(409).json({
          message: "User already exists!",
        });
      } else {
        user
          .save()
          .then((result) => {
            res.status(201).json({
              message: "User created!",
              result: result,
            });
          })
          .catch((err) => {
            res.status(500).json({
              message: "Invalid authentication credentials!",
            });
          });
      }
    });
  });
};

exports.userLogin = (req, res, next) => {
  let fetchedUser;
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      fetchedUser = user;
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        return res.status(401).json({
          message: "Auth failed",
        });
      }
      //add more logic for admin_role
      const token = jwt.sign(
        { email: fetchedUser.email, userId: fetchedUser._id },
        'securesecuresecuresecuresecuresecuresecure',
        { expiresIn: "1h" }
      );
      res.status(200).json({
        token: token,
        expiresIn: 3600,
        userId: fetchedUser._id,
      });
    })
    .catch((err) => {
      console.log(err)
      return res.status(401).json({
        message: "Invalid authentication credentials!",
      });
    });
};
