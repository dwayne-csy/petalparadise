const connection = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    connection.execute(
        'SELECT * FROM users WHERE email = ? AND is_verified = 1 AND deleted_at IS NULL',
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ message: 'Server error' });

            if (results.length === 0) {
                return res.status(401).json({ message: 'Email not verified, user not found, or password incorrect' });
            }

            const user = results[0];

            // Check if account is inactive
            if (user.status !== 'active') {
                return res.status(403).json({ message: 'Your account is inactive. Please contact support.' });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role }, 
                process.env.JWT_SECRET, 
                { expiresIn: '1h' }
            );

            res.status(200).json({
                success: 'Login successful!',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        }
    );
};

module.exports = { loginUser };
