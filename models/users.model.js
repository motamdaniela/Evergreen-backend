module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      type: {
        type: String,
        enum: {
          values: ["user", "admin"],
          message: "{VALUE} is not supported",
        },
        defaultValue: "user",
        required: true,
        allowNull: false,
      },
      email: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      username: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
      },
      name: String,
      password: {
        type: String,
        trim: true,
        allowNull: false,
        required: true,
      },
      school: String,
      previousLoginDate: Number,
      loginDate: Number,
      streak: Number,
      received: Boolean,
      photo: String,
      points: Number,
      activitiesCompleted: Number,
      occurrencesDone: Number,
      rewards: Array,
      state: String,
      council: Boolean,
    },
    { timestamps: false }
  );
  const User = mongoose.model("users", schema);
  return User;
};
