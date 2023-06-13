const config = {
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_NAME,
  HOST: process.env.DB_HOST,
  SECRET: process.env.SECRET,
};
config.URL = `mongodb+srv://${config.USER}:${config.PASSWORD}@${config.HOST}/${config.DB}?retryWrites=true&w=majority`;
// config.URL = `mongodb+srv://${config.USER}:${config.PASSWORD}@${config.HOST}/?retryWrites=true&w=majority`;

module.exports = config;
