module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      date: String,
      hour: String,
      school: String,
      building: String,
      classroom: Number,
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
        defaultValue: "Lâmpada fundida",
      },
      description: String,
      photo: String,
      userID: String,
      state: {
        type: String,
        enum: ["pending", "solved", "repeat", "invalid"],
        defaultValue: "pending",
      },
      other: String,
    },
    { timestamps: false }
  );
  const Occurrence = mongoose.model("mission", schema);
  return Occurrence;
};
