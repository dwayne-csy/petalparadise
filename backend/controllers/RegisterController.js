const connection = require('../config/db');
const bcrypt = require('bcrypt');

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        connection.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword],
            (err, result) => {
                if (err) {
                    console.error("Insert error:", err);
                    return res.status(500).json({ message: 'Database error.' });
                }
                res.status(201).json({ message: 'User registered successfully.' });
            }
        );
    } catch (err) {
        console.error("Hashing error:", err);
        res.status(500).json({ message: 'Server error.' });
    }
};

module.exports = { registerUser };
