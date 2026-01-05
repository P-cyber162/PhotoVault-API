import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redisClient from '../config/redis.js';

export const createApiLimiter = () => rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: 'rl:api:',
    }),
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: {
        status: 'error',
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const createAuthLimiter = () => rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: 'rl:auth:',
    }),
    windowMs: 60 * 60 * 1000,
    max: 5, 
    message: {
        status: 'error',
        message: 'Too many authentication attempts, please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, 
});

export const createPasswordResetLimiter = () => rateLimit({
    store: new RedisStore({
        sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        prefix: 'rl:password:',
    }),
    windowMs: 60 * 60 * 1000,
    max: 3,
    message: {
        status: 'error',
        message: 'Too many password reset attempts, please try again after an hour.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});