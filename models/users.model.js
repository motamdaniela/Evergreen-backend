module.exports = (mongoose) => {
  const schema = mongoose.Schema({
    type: String,
    id: Number,
    email: String,
    username: String,
    name: String,
    password: String,
    school: String,
    previousLoginDate: Number,
    loginDate: Number,
    streak: Number,
    received: Boolean,
    photo: String,
    points: Number,
    activities: Number,
    occurences: Number,
    rewards: Array,
    state: String,
    council: Boolean,
  });
  const User = mongoose.model("users", schema);
  return User;
};
