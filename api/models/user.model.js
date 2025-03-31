const mongoose = require("mongoose");
const { isURL } = require("../validators/string.validators");
const bcrypt = require("bcryptjs");

const SALT_WORK_FACTOR = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^.{8,}$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User name is mandatory"],
      maxLength: [30, "Name characters must be lower than 30"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "User email is required"],
      match: [EMAIL_PATTERN, "Invalid user email pattern"],
    },
    password: {
      type: String,
      required: [true, "User password is required"],
      match: [PASSWORD_PATTERN, "Invalid user password pattern"],
    },
    userType: {
      type: String,
      enum: ["adopter", "shelter"],
      required: [true, "User type is required"],
    },
    avatar: {
      type: String,
      default: function () {
        return `https://i.pinimg.com/236x/9a/b0/75/9ab075d8b2f6cd9ccb084cf43ff88fd5.jpg?u=${this.email}`;
      },
      validate: {
        validator: isURL,
        message: "Invalid avatar URL",
      },
    },
    active: {
      type: Boolean,
      default: false,
    },
    activateToken: {
      type: String,
      default: function () {
        return (
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15) +
          Math.random().toString(36).substring(2, 15)
        );
      },
    },
    // Campos adicionales para Adoptantes
    age: {
      type: Number,
      required: function () {
        return this.userType === "adopter";
      },
    },
    province: {
      type: String,
      required: [true, "Province is mandatory"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Description is required"],
      minLength: [3, "Description needs at least 3 characters"],
      maxLength: [300, "Description characters must be lower than 100"],
    },
    // Campos adicionales para Refugios
    cif: {
      type: String,
      required: function () {
        return this.userType === "shelter";
      },
    },
    website: {
      type: String,
      validate: {
        validator: isURL,
        message: "Invalid website URL",
      },
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        delete ret.password;
        delete ret.activateToken;

        ret.id = doc.id;
        return ret;
      },
    },
  }
);

userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    bcrypt
      .hash(this.password, SALT_WORK_FACTOR)
      .then((hash) => {
        this.password = hash;
        next();
      })
      .catch((error) => next(error));
  } else {
    next();
  }
});

userSchema.methods.checkPassword = function (passwordToCheck) {
  return bcrypt.compare(passwordToCheck, this.password);
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

const User = mongoose.model("User", userSchema);
module.exports = User;
