const { client, isReady } = require('../config/redis.js');
const logger = require('../config/logger.js');
const catchAsync = require('../utils/catchAsync.js');
const httpStatus = require('http-status');

const cache = (group, expiry = 3600) => {
  return catchAsync(async (req, res, next) => {
    if (!isReady()) {
      return next();
    }

    const key = req.user ? `cache:${group}:${req.user.id}:${req.originalUrl}` : `cache:${group}:${req.originalUrl}`;

    if (req.method === 'GET') {
      const data = await client.get(key);

      if (data !== null) {
        logger.info(`Cache hit for key: ${key}`);
        return res.status(httpStatus.OK).send(JSON.parse(data));
      }

      res.sendResponse = res.send;
      res.send = (body) => {
        client.set(key, JSON.stringify(body), { EX: expiry });
        res.sendResponse(body);
      };

      next();
    } else {
      res.on('finish', async () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const keys = await client.keys(`cache:${group}*`);
          await Promise.all(keys.map((key) => client.del(key)));
        }
      });

      next();
    }
  });
};

const deleteCacheByKey = (group) =>
  catchAsync(async (req, res, next) => {
    if (!isReady()) {
      return res.status(httpStatus.NO_CONTENT).json({ message: 'Cache is not ready' });
    }
    if (!group) {
      return res.status(httpStatus.BAD_REQUEST).json({ message: 'Key parameter is required' });
    }

    let key = req.user ? `cache:${group}:${req.user.id}:*` : `cache:${group}:*`;

    const keys = await client.keys(key);
    await Promise.all(keys.map((key) => client.del(key)));

    next();
  });

const clearCache = catchAsync(async (req, res) => {
  if (!isReady()) {
    return res.status(httpStatus.NO_CONTENT).json({ message: 'Cache is not ready' });
  }

  const key = req.params.key;

  if (!key) {
    const keys = await client.keys(`cache:*`);
    await Promise.all(keys.map((key) => client.del(key)));
  } else {
    await client.del(key);
  }

  return res.status(httpStatus.NO_CONTENT).json({ message: 'Cache cleared' });
});

module.exports = { cache, clearCache, deleteCacheByKey };
