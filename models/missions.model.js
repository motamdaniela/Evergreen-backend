module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      title: String,
      description: String,
      reward: String,
      users: Array,
      max: Number,
      redirect: String,
      type: Number,
    },
    { timestamps: false }
  );
  const Mission = mongoose.model("missions", schema);
  return Mission;
};
