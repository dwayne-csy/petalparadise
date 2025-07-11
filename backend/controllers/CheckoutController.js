const db = require('../config/db');

// Solo checkout: create pending order, add items, don't confirm yet
exports.checkoutSolo = (req, res) => {
    const userId = req.user.id;

    const getSoloSql = "SELECT id, sell_price FROM products WHERE category = 'Solo'";
    db.query(getSoloSql, (err, soloProducts) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ message: 'Failed to get solo products' });
        }
        if (soloProducts.length === 0) {
            return res.status(400).json({ message: 'No solo products found' });
        }

        // ✅ Create order with status 'pending'
        const createOrderSql = 'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES (?, "pending", NOW(), NOW())';
        db.query(createOrderSql, [userId], (err, orderResult) => {
            if (err) {
                console.error('Failed to create order:', err);
                return res.status(500).json({ message: 'Failed to create order' });
            }
            const orderId = orderResult.insertId;

            // Insert order_items
            const insertItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) VALUES ?';
            const values = soloProducts.map(prod => [orderId, prod.id, 1, prod.sell_price, new Date(), new Date()]);
            db.query(insertItemsSql, [values], (err) => {
                if (err) {
                    console.error('Failed to insert order_items:', err);
                    return res.status(500).json({ message: 'Failed to add order items' });
                }
                res.json({ message: 'Solo checkout prepared', orderId });
            });
        });
    });
};

// Cart checkout: same logic
exports.checkoutCart = (req, res) => {
    const userId = req.user.id;

    const getCartSql = `
        SELECT c.product_id, c.quantity, p.sell_price
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;
    db.query(getCartSql, [userId], (err, cartItems) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ message: 'Failed to get cart items' });
        }
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        // ✅ Create order with status 'pending'
        const createOrderSql = 'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES (?, "pending", NOW(), NOW())';
        db.query(createOrderSql, [userId], (err, orderResult) => {
            if (err) {
                console.error('Failed to create order:', err);
                return res.status(500).json({ message: 'Failed to create order' });
            }
            const orderId = orderResult.insertId;

            // Insert order_items
            const insertItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) VALUES ?';
            const values = cartItems.map(item => [orderId, item.product_id, item.quantity, item.sell_price, new Date(), new Date()]);
            db.query(insertItemsSql, [values], (err) => {
                if (err) {
                    console.error('Failed to insert order_items:', err);
                    return res.status(500).json({ message: 'Failed to add order items' });
                }

                // Clear cart
                db.query('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                    if (err) {
                        console.error('Failed to clear cart:', err);
                        return res.status(500).json({ message: 'Checked out but failed to clear cart' });
                    }
                    res.json({ message: 'Cart checkout prepared', orderId });
                });
            });
        });
    });
};

// Get checkout details: get latest pending order items
exports.getCheckoutDetails = (req, res) => {
    const userId = req.user.id;

    const sql = `
        SELECT oi.*, p.name, p.image, p.sell_price
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = (
            SELECT id FROM orders WHERE user_id=? AND status='pending' ORDER BY created_at DESC LIMIT 1
        )
    `;
    db.query(sql, [userId], (err, items) => {
        if (err) {
            console.error('Failed to load checkout details:', err);
            return res.status(500).json({ message: 'Could not load checkout items' });
        }
        res.json({ checkout: items });
    });
};

// Confirm checkout: customer provides shipping_address & payment_method, updates order to 'confirmed'
exports.confirmCheckout = (req, res) => {
    const { orderId, shipping_address, payment_method } = req.body;

    if (!orderId || !shipping_address || !payment_method) {
        return res.status(400).json({ message: 'Order ID, shipping address, and payment method are required' });
    }

    // make sure this code only updates status to confirmed:
    const sql = `
        UPDATE orders
        SET shipping_address = ?,
            payment_method = ?,
            updated_at = NOW()
        WHERE id = ?
    `;
    db.query(sql, [shipping_address, payment_method, orderId], (err, result) => {
        if (err) {
            console.error('Failed to update order:', err);
            return res.status(500).json({ message: 'Failed to update order' });
        }
        res.json({ message: 'Place Order successfully!' });
    });
};
