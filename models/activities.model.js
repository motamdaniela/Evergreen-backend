module.exports = (mongoose) => {
  const schema = mongoose.Schema({
    photo: String,
    idTheme: String,
    date: String,
    begin: Number,
    end: Number,
    description: Array,
    title: String,
    coordinator: String,
    place: String,
    users: Array,
  });
  const Activity = mongoose.model("activities", schema);
  return Activity;
};
