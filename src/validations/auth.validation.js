import Joi from 'joi';

const emailValidation = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
  }),
};

const refreshTokens = {
  body: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

export default {
  emailValidation,
  refreshTokens,
};
