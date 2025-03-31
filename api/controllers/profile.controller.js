const User = require("../models/user.model");
const Match = require("../models/match.model");

module.exports.getProfile = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user?._id;
  const userType = req.user?.userType;
  try {
    const requestedUser = await User.findById(id);

    if (!requestedUser) {
      return res.status(404).json({ message: "Profile not found!!" });
    }

    // Mostrar perfil de un refugio (público)
    if (requestedUser.userType === "shelter") {
      return res.status(200).json({
        name: requestedUser.name,
        avatar: requestedUser.avatar,
        email: requestedUser.email,
        province: requestedUser.province,
        description: requestedUser.description,
      });
    }

    // Mostrar perfil de un usuario (Restringido)
    if (requestedUser.userType === "adopter") {
      //  El que solicita es el propio usuario
      if (userId?.equals(requestedUser.id)) {
        return res.status(200).json({
          name: requestedUser.name,
          avatar: requestedUser.avatar,
          age: requestedUser.age,
          email: requestedUser.email,
          province: requestedUser.province,
          description: requestedUser.description,
        });
      }

      //  si el que solicita es un refugio que ha hecho match con este usuario
      if (userType === "shelter") {
        const matchExists = await Match.findOne({
          adopter: requestedUser.id,
          shelter: userId,
        });

        if (matchExists) {
          return res.status(200).json({
            name: requestedUser.name,
            avatar: requestedUser.avatar,
            age: requestedUser.age,
            email: requestedUser.email,
            province: requestedUser.province,
            description: requestedUser.description,
          });
        } else {
          return res
            .status(403)
            .json({ message: "You are not authorized to view this profile." });
        }
      }

      return res
        .status(403)
        .json({ message: "You are not authorized to view this profile." });
    }

    res.status(404).json({ message: "Profile not found." });
  } catch (error) {
    next(error);
  }
};
