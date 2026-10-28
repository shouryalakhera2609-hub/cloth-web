const session = require('express-session');

module.exports = session({
  secret: 'dukaanSecret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // true only for https
});
