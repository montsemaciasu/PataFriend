const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const createError = require("http-errors");
const pets = require("../controllers/pets.controller");
const users = require("../controllers/users.controller");
const sessions = require("../controllers/sessions.controller");
const auth = require("../middlewares/session.middleware");
const storage = require("../config/storage.config");
const profile = require("../controllers/profile.controller");

router.get("/pets", pets.list);

router.post("/pets", auth.isAuthenticated, auth.isShelter, pets.create);
router.get("/pets/random-urgent", pets.getRandomUrgentPet);
router.get("/pets/match-statuses", pets.getAllMatchStatuses);
router.get("/pets/matches", auth.isAuthenticated, pets.getMatchesByStatus);

router.get("/pets/:id", pets.detail);
router.delete("/pets/:id", auth.isAuthenticated, auth.isShelter, pets.delete);
router.patch("/pets/:id", auth.isAuthenticated, auth.isShelter, pets.update);
router.delete(
  "/pets/:id/matches",
  auth.isAuthenticated,
  pets.deleteMatchByPetId
);
router.post("/pets/:id/matches", auth.isAuthenticated, pets.createMatch);
router.get(
  "/pets/:id/matches/status",
  auth.isAuthenticated,
  pets.getAllMatchStatuses
);
router.patch("/pets/:id/matches/no-match", auth.isAuthenticated, pets.noMatch);
router.get(
  "/pets/:id/matches/:matchId",
  auth.isAuthenticated,
  pets.getMatchDetail
);
router.patch(
  "/pets/:id/matches/:matchId",
  auth.isAuthenticated,
  auth.isShelter,
  pets.getAllMatchStatuses
);
router.delete(
  "/pets/:id/matches/:matchId",
  auth.isAuthenticated,
  auth.isShelter,
  pets.deleteMatch
);
router.patch("/pets/matches/:matchId/status", pets.updateMatchStatus);

router.get("/pets/shelter/:id", pets.getPetsByShelter);
router.get("/pets/matches/:id", pets.getMatchedPetsByUser);
router.get("/pets/:petId/match-details", pets.getMatchesByPet);
router.get("/shelter/matches", pets.getMatchesForShelter);

router.post("/users", storage.single("avatar"), users.create);
router.patch("/users/me", auth.isAuthenticated, users.update);
router.get("/users/me", auth.isAuthenticated, users.profile);

// Ruta para obtener perfil del refugio (público)
router.get("/shelters/:id", profile.getProfile);

// Ruta para obtener perfil del usuario (protegido)
router.get("/users/:id", auth.isAuthenticated, profile.getProfile);
router.get("/users/:id/validate", users.validate);

router.post("/sessions", sessions.create);
router.delete("/sessions", auth.isAuthenticated, sessions.destroy);

// Rutas para Matches (incluidas dentro del pets.controller)

router.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

router.use((req, res, next) => {
  next(createError(404, "Route not found"));
});

router.use((error, req, res, next) => {
  if (
    error instanceof mongoose.Error.CastError &&
    error.message.includes("_id")
  )
    error = createError(404, "Resource not found");
  else if (error instanceof mongoose.Error.ValidationError)
    error = createError(400, error);
  else if (!error.status) error = createError(500, error.message);
  console.error(error);

  const data = {};
  data.message = error.message;
  if (error.errors) {
    data.errors = Object.keys(error.errors).reduce((errors, errorKey) => {
      errors[errorKey] =
        error.errors[errorKey]?.message || error.errors[errorKey];
      return errors;
    }, {});
  }
  res.status(error.status).json(data);
});

module.exports = router;
