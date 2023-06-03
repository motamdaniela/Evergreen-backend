// let mongoose = require("mongoose");

// let Schema = mongoose.Schema,
//   ObjectId = Schema.ObjectId;
module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      date: {
        type: String,
        allowNull: false,
        required: true,
      },
      hour: {
        type: String,
        allowNull: false,
        required: true,
      },
      school: {
        type: String,
        allowNull: false,
        required: true,
      },
      building: {
        type: String,
        allowNull: false,
        required: true,
      },
      classroom: {
        type: Number,
        allowNull: false,
        required: true,
      },
      type: {
        type: String,
        enum: [
          "Lâmpada fundida",
          "Torneira a pingar",
          "Luz ligada",
          "Objeto quebrado",
          "Mal-funcionamento",
          "Lixo no chão",
          "Outro",
        ],
      },
      description: {
        type: String,
        allowNull: false,
        required: true,
      },
      photo: {
        type: String,
        allowNull: false,
        required: true,
      },
      userID: {
        type: mongoose.Schema.Types.ObjectId,
        allowNull: false,
        required: true,
      },
      state: {
        type: String,
        enum: ["pending", "solved", "repeat", "invalid"],
        defaultValue: "pending",
      },
      other: {
        type: String,
      },
    },
    { timestamps: false }
  );
  const Occurrence = mongoose.model("occurrences", schema);
  return Occurrence;
};
