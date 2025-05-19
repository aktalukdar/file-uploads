const prisma = require('../prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

async function findUserByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
}

// Validate user by comparing hashed password with plaintext password
async function validateUser(email, password) {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
}

// Hash password before creating user (example helper)
async function hashPassword(plainPassword) {
    return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

function generateToken(user) {
    return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: '1h',
    });
}

module.exports = {
    findUserByEmail,
    validateUser,
    generateToken,
    hashPassword,
};
