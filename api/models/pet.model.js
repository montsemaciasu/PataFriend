const mongoose = require("mongoose");
const dayjs = require("dayjs");
const Match = require("./match.model");

const petSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    breed: { type: String, trim: true },
    birthDate: { type: Date, required: true },
    ageYears: { type: Number, default: 0 },
    ageMonths: { type: Number, default: 0 },
    species: {
      type: String,
      required: true,
      enum: ["dog", "cat", "rabbit", "horse", "other"],
    },
    photos: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
    shelterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    urgentTag: { type: Boolean, default: false },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        ret.age = ret.ageYears
          ? `${ret.ageYears} years${
              ret.ageMonths ? ` and ${ret.ageMonths} months` : ""
            }`
          : `${ret.ageMonths} months`;
        delete ret.ageYears;
        delete ret.ageMonths;
      },
    },
  }
);

petSchema.pre("findOneAndDelete", async function (next) {
  const petId = this.getQuery()._id;

  try {
    await Match.deleteMany({ pet: petId });
    next();
  } catch (error) {
    next(error);
  }
});

petSchema.pre("save", function (next) {
  if (this.isModified("birthDate")) {
    const now = dayjs();
    const birth = dayjs(this.birthDate);

    this.ageYears = now.diff(birth, "year");
    this.ageMonths = now.diff(birth.add(this.ageYears, "year"), "month");
  }
  next();
});

const Pet = mongoose.model("Pet", petSchema);
module.exports = Pet;
