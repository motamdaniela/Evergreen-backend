module.exports = (mongoose) => {
  const schema = mongoose.Schema({
    id: Number,
    photo: String,
    idTheme: Number,
    date: String,
    begin: Number,
    end: Number,
    desc1: String,
    desc2: String,
    desc3: String,
    title: String,
    coordinator: String,
    place: String,
    users: Array,
    participated: Array,
  });
  const Activity = mongoose.model("activities", schema);
  return Activity;
};
