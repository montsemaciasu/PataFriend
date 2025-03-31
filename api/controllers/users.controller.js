const createError = require("http-errors");
const User = require("../models/user.model");
const { sendValidationEmail } = require("../config/mailer.config");

module.exports.create = (req, res, next) => {
  const { email } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (user)
        next(400, {
          errors: {
            message: "User email already taken",
            email: "Already exists",
          },
        });
      else {
        const newUser = {
          email: req.body.email,
          password: req.body.password,
          name: req.body.name,
          avatar: req.file?.path,
          userType: req.body.userType,
          province: req.body.province,
          description: req.body.description,
        };

        console.log(newUser);

        if (newUser.userType === "adopter") {
          newUser.age = req.body.age;
        } else if (newUser.userType === "shelter") {
          newUser.cif = req.body.cif;
          if (req.body.website) {
            newUser.website = req.body.website;
          }
        }

        return User.create(newUser)
          .then((user) => {
            sendValidationEmail(user);
            res.status(201).json(user);
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => next(error));
};

module.exports.update = (req, res, next) => {
  const permittedBody = {
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    avatar: req.body.avatar,
    description: req.body.description,
  };

  //remove undefined keys
  Object.keys(permittedBody).forEach((key) => {
    if (permittedBody[key] === undefined) {
      delete permittedBody[key];
    }
  });

  Object.assign(req.user, permittedBody);

  req.user
    .save()
    .then((user) => res.json(user))
    .catch(next);
};

module.exports.validate = (req, res, next) => {
  User.findOne({ _id: req.params.id, activateToken: req.query.token })
    .then((user) => {
      if (user) {
        user.active = true;
        user.save().then((user) => res.json(user));
      } else {
        next(createError(404, "User not found"));
      }
    })
    .catch(next);
};

module.exports.profile = (req, res, next) => {
  res.json(req.user);
};
