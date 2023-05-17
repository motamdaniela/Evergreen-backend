module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      theme: {
        type: String,
        enum: [
          "Água",
          "Resíduos",
          "Energia",
          "Espaços exteriores",
          "Mar",
          "Mobilidade",
          "Outros",
        ],
        required: true,
        allowNull: false,
      },
      description: {
        type: String,
        allowNull: false,
        required: true,
      },
      objectives: {
        type: String,
        allowNull: false,
        required: true,
      },
      goals: {
        type: String,
        allowNull: false,
        required: true,
      },
      resources: {
        type: String,
        allowNull: false,
        required: true,
      },
      userID: {
        type: String,
        allowNull: false,
        required: true,
      },
    },
    { timestamps: false }
  );
  const Suggestion = mongoose.model("suggestions", schema);
  return Suggestion;
};
