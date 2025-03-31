const createError = require("http-errors");
const Pet = require("../models/pet.model");
const Match = require("../models/match.model");

// =================== PET METHODS ===================

module.exports.list = (req, res, next) => {
  Pet.find()
    .populate("shelterId", "name province")
    .then((pets) => res.json(pets))
    .catch((error) => next(error));
};

module.exports.create = (req, res, next) => {
  const { body } = req;

  const permittedBody = {
    name: body.name,
    description: body.description,
    breed: body.breed,
    birthDate: body.birthDate,
    species: body.species,
    photos: body.photos,
    isAvailable: body.isAvailable,
    shelterId: req.user._id,
    urgentTag: body.urgentTag || false,
  };

  Object.keys(permittedBody).forEach((key) => {
    if (permittedBody[key] === undefined) {
      delete permittedBody[key];
    }
  });

  if (permittedBody.birthDate) {
    const birthYear = new Date(permittedBody.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    permittedBody.age = currentYear - birthYear;
  }

  Pet.create(permittedBody)
    .then((pet) => res.status(201).json(pet))
    .catch((error) => next(error));
};

module.exports.detail = (req, res, next) => {
  const { id } = req.params;
  Pet.findById(id)
    .then((pet) => {
      if (!pet) return next(createError(404, "Pet not found"));
      res.json(pet);
    })
    .catch(() => next(createError(404, "Pet not found")));
};

module.exports.delete = (req, res, next) => {
  const { id } = req.params;
  Pet.findByIdAndDelete(id)
    .then((pet) => {
      if (!pet) return next(createError(404, "Pet not found"));
      res.status(204).send();
    })
    .catch((error) => next(error));
};

module.exports.update = (req, res, next) => {
  const { id } = req.params;
  const { body } = req;

  const permittedBody = {
    name: body.name,
    description: body.description,
    breed: body.breed,
    birthDate: body.birthDate,
    species: body.species,
    photos: body.photos,
    isAvailable: body.isAvailable,
    urgentTag: body.urgentTag || false,
  };

  if (permittedBody.birthDate) {
    const birthYear = new Date(permittedBody.birthDate).getFullYear();
    const currentYear = new Date().getFullYear();
    permittedBody.age = currentYear - birthYear;
  }

  Pet.findByIdAndUpdate(id, permittedBody, { runValidators: true, new: true })
    .then((pet) => {
      if (!pet) return next(createError(404, "Pet not found"));
      res.status(201).json(pet);
    })
    .catch((error) => next(error));
};

module.exports.getRandomUrgentPet = async (req, res, next) => {
  try {
    const urgentPets = await Pet.find({ urgentTag: true }).populate({
      path: "shelterId",
      select: "name province",
    });

    if (!urgentPets.length) {
      return res.status(404).json({ message: "No urgent pets found." });
    }

    const weekOfYear = Math.floor(
      new Date().getTime() / (1000 * 60 * 60 * 24 * 7)
    );
    const randomIndex = weekOfYear % urgentPets.length;

    const randomPet = urgentPets[randomIndex];

    res.json(randomPet);
  } catch (error) {
    next(error);
  }
};

// =================== MATCH METHODS ===================

// Crear un Match
module.exports.createMatch = async (req, res, next) => {
  const { id } = req.params; // ID del pet
  const adopterId = req.user._id; // ID del usuario

  try {
    const pet = await Pet.findById(id);
    if (!pet) {
      return next(createError(404, "Pet not found"));
    }

    const existingMatch = await Match.findOne({ adopter: adopterId, pet: id });

    // Si el match ya existe, actualizar `isMatched` a `true`
    if (existingMatch) {
      existingMatch.isMatched = true;
      await existingMatch.save();
      return res.status(200).json(existingMatch);
    }

    // Si no hay match, crearlo con `isMatched: true`
    const match = await Match.create({
      adopter: adopterId,
      pet: id,
      shelter: pet.shelterId,
      status: "pending",
      isMatched: true,
    });

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

// Marcar como 'No Match'
module.exports.noMatch = async (req, res, next) => {
  const { id } = req.params;
  const adopterId = req.user._id;
  const userRole = req.user.userType;

  if (userRole !== "adopter") {
    return res
      .status(403)
      .json({ message: "Only Adopters can mark 'No Match'." });
  }

  try {
    const existingMatch = await Match.findOne({ adopter: adopterId, pet: id });

    if (!existingMatch) {
      const pet = await Pet.findById(id);
      if (!pet) {
        return next(createError(404, "Pet not found"));
      }

      const noMatch = await Match.create({
        adopter: adopterId,
        pet: id,
        shelter: pet.shelterId,
        status: "pending",
        isMatched: false,
      });

      return res.status(201).json({ message: "Marked as 'No Match'." });
    }

    // Si existe el match, se actualiza el estado a `isMatched: false`
    existingMatch.isMatched = false;
    await existingMatch.save();

    res.status(200).json({ message: "Match marked as 'No Match'." });
  } catch (error) {
    next(error);
  }
};

module.exports.getMatchesByStatus = async (req, res, next) => {
  const adopterId = req.user?._id;

  try {
    const matches = await Match.find({ adopter: adopterId }).populate({
      path: "pet",
      select: "name description photos shelterId",
      populate: { path: "shelterId", select: "name province" },
    });

    const approved = matches.filter(
      (match) => match.status === "accepted" && match.isMatched === true
    );
    const pending = matches.filter(
      (match) => match.status === "pending" && match.isMatched === true
    );
    const rejected = matches.filter(
      (match) => match.status === "rejected" && match.isMatched === true
    );

    res.status(200).json({ approved, pending, rejected });
  } catch (error) {
    next(error);
  }
};

// Obtener el detalle de un Match
module.exports.getMatchDetail = (req, res, next) => {
  const { matchId } = req.params;

  Match.findById(matchId)
    .populate("adopter", "name email")
    .populate("pet", "name species photos")
    .populate("shelter", "name province")
    .then((match) => {
      if (!match) return next(createError(404, "Match not found"));
      res.json(match);
    })
    .catch(() => next(createError(404, "Match not found")));
};

module.exports.getAllMatchStatuses = async (req, res, next) => {
  const adopterId = req.user?._id;
  const userRole = req.user?.userType;

  try {
    if (adopterId && userRole === "adopter") {
      const matches = await Match.find({ adopter: adopterId });

      console.log(matches);

      const matchedPets = matches
        .filter((match) => match.isMatched == true)
        .map((match) => match.pet.toString());

      const noMatchPets = matches
        .filter((match) => match.isMatched === false)
        .map((match) => match.pet.toString());

      const undefinedMatchPets = await Pet.find({
        _id: {
          $nin: [...matchedPets, ...noMatchPets], // Excluir aquellos que ya tienen match/no-match para este adopter
        },
      }).select("_id");

      console.log(matchedPets);

      return res.status(200).json({
        matchedPets,
        noMatchPets,
        undefinedMatchPets: undefinedMatchPets.map((pet) => pet._id.toString()),
      });
    }

    // Si el usuario NO está logueado o no es "Adopter", devolver todos los perros
    const allPets = await Pet.find().select("_id");
    const allPetIds = allPets.map((pet) => pet._id.toString());

    return res.status(200).json({ undefinedMatchPets: allPetIds });
  } catch (error) {
    next(error);
  }
};

// Actualizar el estado del Match (aceptar/rechazar)
module.exports.updateMatchStatus = async (req, res, next) => {
  const { matchId } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const match = await Match.findByIdAndUpdate(
      matchId,
      { status },
      { new: true }
    );

    if (!match) return next(createError(404, "Match not found"));

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};

// Eliminar Match solo si el Shelter lo rechaza
module.exports.deleteMatch = (req, res, next) => {
  const { matchId } = req.params;

  Match.findByIdAndDelete(matchId)
    .then((match) => {
      if (!match) return next(createError(404, "Match not found"));
      res.status(204).send();
    })
    .catch((error) => next(error));
};

module.exports.deleteMatchByPetId = async (req, res, next) => {
  const { id } = req.params;

  const adopterId = req.user._id;
  console.log(req.params, adopterId);

  try {
    const match = await Match.findOneAndDelete({
      adopter: adopterId,
      pet: id,
    });

    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Obtener perros de un refugio por shelterId
module.exports.getPetsByShelter = async (req, res, next) => {
  const { id } = req.params;
  try {
    const pets = await Pet.find({
      shelterId: id,
    }).populate("shelterId", "name province");
    res.status(200).json(pets);
  } catch (error) {
    next(error);
  }
};

// Obtener perros con los que un usuario ha hecho match
module.exports.getMatchedPetsByUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const matches = await Match.find({
      adopter: id,
      isMatched: true,
      status: { $in: ["pending", "accepted"] },
    }).populate({
      path: "pet",
      populate: {
        path: "shelterId",
        select: "name province",
      },
    });

    const matchedPets = matches.map((match) => ({
      ...match.pet.toObject(),
      shelterName: match.pet.shelterId.name,
      shelterProvince: match.pet.shelterId.province,
    }));

    res.status(200).json(matchedPets);
  } catch (error) {
    next(error);
  }
};

module.exports.getMatchesByPet = async (req, res, next) => {
  const { petId } = req.params;

  if (req.user.userType !== "shelter") {
    return res
      .status(403)
      .json({ message: "Only shelters can view match details." });
  }

  try {
    const matches = await Match.find({ pet: petId }).populate({
      path: "adopter",
      select: "avatar name email province description",
    });

    if (!matches.length) {
      return res
        .status(404)
        .json({ message: "No matches found for this pet." });
    }

    const formattedMatches = matches.map((match) => ({
      _id: match._id,
      adopter: match.adopter,
      status: match.status,
    }));

    res.status(200).json(formattedMatches);
  } catch (error) {
    next(error);
  }
};

module.exports.getMatchesForShelter = async (req, res, next) => {
  const shelterId = req.user?._id; // ID del refugio logueado

  try {
    const matches = await Match.find({ shelter: shelterId })
      .populate({
        path: "pet",
        populate: {
          path: "shelterId",
          select: "name province",
        },
        select: "name description photos",
      })
      .populate({
        path: "adopter",
        select: "avatar name email province description id",
      });

    matches.forEach((match) => {
      console.log(`🔎 Pet: ${match.pet.name}`);
      console.log(`👤 Adopter Name: ${match.adopter?.name}`);
      console.log(`🖼️ Adopter Avatar: ${match.adopter?.avatar}`);
    });

    const approved = matches.filter((match) => match.status === "accepted");
    const pending = matches.filter((match) => match.status === "pending");
    const rejected = matches.filter((match) => match.status === "rejected");

    res.status(200).json({ approved, pending, rejected });
  } catch (error) {
    next(error);
  }
};

module.exports.updateMatchStatus = async (req, res, next) => {
  const { matchId } = req.params;
  const { status } = req.body;

  if (!["accepted", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const match = await Match.findByIdAndUpdate(
      matchId,
      { status },
      { new: true }
    );

    if (!match) return next(createError(404, "Match not found"));

    res.status(200).json(match);
  } catch (error) {
    next(error);
  }
};
