module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      type: {
        type: String,
        enum: {
          values: ["user", "admin", "security"],
          message: "{VALUE} is not supported",
        },
        default: "user",
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
      name: {
        type: String,
        allowNull: false,
        required: true,
      },
      password: {
        type: String,
        trim: true,
        allowNull: false,
        required: true,
      },
      school: {
        type: String,
        allowNull: false,
      },
      previousLoginDate: Number,
      loginDate: Number,
      streak: Number,
      received: Boolean,
      photo: {
        type: String,
        default:
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
      },
      points: Number,
      activitiesCompleted: Number,
      occurrencesDone: Number,
      rewards: Array,
      state: {
        type: String,
        enum: {
          values: ["active", "blocked"],
          message: "{VALUE} is not supported",
        },
        default: "active",
        allowNull: false,
        required: true,
      },
      council: Boolean,
    },
    { timestamps: false }
  );
  const User = mongoose.model("users", schema);
  return User;
};
