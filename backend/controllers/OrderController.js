const db = require('../config/db'); // adjust if needed

// Get all orders with total amount
exports.getAllOrders = (req, res) => {
    const sql = `
        SELECT o.*, 
            (SELECT SUM(oi.quantity * oi.price) FROM order_items oi WHERE oi.order_id = o.id) AS total_amount
        FROM orders o
        ORDER BY o.created_at DESC
    `;
    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Failed to get orders:', err);
            return res.status(500).json({ message: 'Failed to get orders' });
        }
        res.json(rows);
    });
};

// Accept order → status becomes 'Accepted'
exports.acceptOrder = (req, res) => {
    const orderId = req.params.id;
    const sql = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
    db.query(sql, ['Accepted', orderId], (err) => {
        if (err) {
            console.error('Failed to accept order:', err);
            return res.status(500).json({ message: 'Failed to accept order' });
        }
        res.json({ message: 'Order accepted successfully' });
    });
};

// Update status to any value
exports.updateOrderStatus = (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const sql = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
    db.query(sql, [status, orderId], (err) => {
        if (err) {
            console.error('Failed to update status:', err);
            return res.status(500).json({ message: 'Failed to update status' });
        }
        res.json({ message: 'Status updated successfully' });
    });
};
