module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      type: {
        type: String,
        enum: ["admin", "user", "security"],
        defaultValue: "user",
        // validate: {
        //   isIn: {
        //     args: [["admin", "user", "security"]],
        //     msg: "Allowed roles: admin, user or security",
        //   },
        // },
      },
      id: Number,
      email: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
        // validate: {
        //   notNull: { msg: "Email cannot be empty or null!" },
        // },
      },
      username: {
        type: String,
        unique: true,
        allowNull: false,
        required: true,
        // validate: {
        //   notNull: { msg: "Username cannot be empty or null!" },
        // },
      },
      name: String,
      password: {
        type: String,
        trim: true, // remove spaces on both ends
        allowNull: false,
        required: true,
        // validate: {
        //   notNull: { msg: "Password cannot be empty or null!" },
        // },
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
