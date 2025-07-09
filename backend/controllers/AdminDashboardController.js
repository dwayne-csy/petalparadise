const connection = require('../config/db');

const getAdminDashboard = (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }



    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error', details: err });
        }

        return res.status(200).json({
            success: true,
            message: "Welcome to Admin Dashboard",
            stats: results[0]
        });
    });
};

module.exports = { getAdminDashboard };
