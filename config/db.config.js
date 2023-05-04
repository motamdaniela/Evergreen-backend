const config = {
  /* don't expose password or any sensitive info, done only for demo */
  // if environment variables are not defined, use default values
  USER: process.env.DB_USER || "beatriz",
  PASSWORD: process.env.DB_PASSWORD || 123,
  DB: process.env.DB_NAME || "Evergreen",
  HOST: process.env.DB_HOST || "atlascluster.wdlmhli.mongodb.net",
};
// config.URL = `mongodb+srv://${config.USER}:${config.PASSWORD}.@${config.HOST}/${config.DB}?retryWrites=true&w=majority`;
config.URL = `mongodb+srv://beatriz:123@atlascluster.wdlmhli.mongodb.net/Evergreen?retryWrites=true&w=majority`;
console.log(config.URL);

module.exports = {
  config,
  SECRET: process.env.SECRET
}
