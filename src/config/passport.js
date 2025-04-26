const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const config = require('./config.js');
const { tokenTypes } = require('./tokens.js');
const { User } = require('../models/index.js');
const { getCacheByKey, setCacheByKey, CACHE_KEYS } = require('./config/redis.js');

const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const CACHE_EXPIRY = 300;

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }

    const cacheKey = `${CACHE_KEYS.USER}:${payload.sub}`;
    let user = await getCacheByKey(cacheKey);

    if (!user) {
      user = await User.findById(payload.sub).populate('email');
      if (!user) {
        return done(null, false);
      }

      setCacheByKey(cacheKey, user, CACHE_EXPIRY);
    }

    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = { jwtStrategy };
