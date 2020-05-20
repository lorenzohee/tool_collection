const config = {
  env: process.env.NODE_ENV,
  port: process.env.SERVER_PORT,
  mongooseDebug: process.env.MONGOOSE_DEBUG,
  jwtSecret: process.env.JWT_SECRET,
  frontend: process.env.MEAN_FRONTEND || 'angular',
  mongo: {
    host: 'mongodb://localhost/mean',
    port: 27017
  },
};

module.exports = config;
