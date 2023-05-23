module.exports = (mongoose) => {
  const schema = mongoose.Schema({
    name: String,
    color: String,
  });
  const Theme = mongoose.model("themes", schema);
  return Theme;
};
