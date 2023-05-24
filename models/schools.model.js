module.exports = (mongoose) => {
    const schema = mongoose.Schema(
      {
        name: String,
        buildings: Array
      }
    )
    const School = mongoose.model("schools", schema);
    return School;
}