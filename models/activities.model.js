module.exports = (mongoose) => {
  const schema = mongoose.Schema({
    id: Number,
    photo: String,
    idTheme: Number,
    date: String,
    begin: Number,
    end: Number,
    description: String,
    title: String,
    coordinator: String,
    place: String,
    users: Array,
  });
  const Activity = mongoose.model("activities", schema);
  return Activity;
};
