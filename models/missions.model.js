module.exports = (mongoose) => {
  const schema = mongoose.Schema(
    {
      id: Number,
      title: String,
      description: String,
      reward: String,
      users: Array,
      max: Number, 
      redirect: String,
      type: Number
    },
    { timestamps: false }
  );
  const Mission = mongoose.model("mission", schema);
  return Mission;
};
