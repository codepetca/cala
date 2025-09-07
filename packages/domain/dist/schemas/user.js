"use strict";
/**
 * User Domain Schema
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = void 0;
const zod_1 = require("zod");
exports.UserSchema = zod_1.z.object({
    id: zod_1.z.string().describe('Unique user identifier'),
    name: zod_1.z.string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less')
        .describe('User display name'),
    email: zod_1.z.string()
        .email('Must be a valid email address')
        .describe('User email address (unique)'),
    createdAt: zod_1.z.date().describe('When the user account was created'),
});
