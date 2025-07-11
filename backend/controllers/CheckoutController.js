const db = require('../config/db');

// 🛒 Solo checkout
exports.checkoutSolo = (req, res) => {
    const userId = req.user.id;

    const getSoloSql = "SELECT id, sell_price FROM products WHERE category = 'Solo'";
    db.query(getSoloSql, (err, soloProducts) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (soloProducts.length === 0) {
            return res.status(400).json({ message: 'No solo products found' });
        }

        const createOrderSql = 'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES (?, "pending", NOW(), NOW())';
        db.query(createOrderSql, [userId], (err, orderResult) => {
            if (err) return res.status(500).json({ message: 'Failed to create order' });

            const orderId = orderResult.insertId;

            // add order items
            const values = soloProducts.map(prod => [orderId, prod.id, 1, prod.sell_price, new Date(), new Date()]);
            const insertItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) VALUES ?';
            db.query(insertItemsSql, [values], (err) => {
                if (err) return res.status(500).json({ message: 'Failed to add order items' });

                // decrease stock
                const stockUpdates = soloProducts.map(prod =>
                    new Promise((resolve, reject) => {
                        db.query('UPDATE products SET stock = stock - 1 WHERE id = ?', [prod.id], (err) => {
                            if (err) reject(err); else resolve();
                        });
                    })
                );

                Promise.all(stockUpdates)
                    .then(() => res.json({ message: 'Solo checkout prepared', orderId }))
                    .catch(err => res.status(500).json({ message: 'Failed to update product stock' }));
            });
        });
    });
};

// 🛒 Cart checkout
exports.checkoutCart = (req, res) => {
    const userId = req.user.id;

    const getCartSql = `
        SELECT c.product_id, c.quantity, p.sell_price
        FROM cart_items c
        JOIN products p ON c.product_id = p.id
        WHERE c.user_id = ?
    `;
    db.query(getCartSql, [userId], (err, cartItems) => {
        if (err) return res.status(500).json({ message: 'DB error' });
        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Your cart is empty' });
        }

        const createOrderSql = 'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES (?, "pending", NOW(), NOW())';
        db.query(createOrderSql, [userId], (err, orderResult) => {
            if (err) return res.status(500).json({ message: 'Failed to create order' });

            const orderId = orderResult.insertId;

            const values = cartItems.map(item => [orderId, item.product_id, item.quantity, item.sell_price, new Date(), new Date()]);
            const insertItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) VALUES ?';
            db.query(insertItemsSql, [values], (err) => {
                if (err) return res.status(500).json({ message: 'Failed to add order items' });

                // decrease stock
                const stockUpdates = cartItems.map(item =>
                    new Promise((resolve, reject) => {
                        db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id], (err) => {
                            if (err) reject(err); else resolve();
                        });
                    })
                );

                Promise.all(stockUpdates)
                    .then(() => {
                        // clear cart
                        db.query('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                            if (err) return res.status(500).json({ message: 'Checked out but failed to clear cart' });
                            res.json({ message: 'Cart checkout prepared', orderId });
                        });
                    })
                    .catch(err => res.status(500).json({ message: 'Failed to update product stock' }));
            });
        });
    });
};

// 📦 Get checkout details (latest pending order)
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
        if (err) return res.status(500).json({ message: 'Could not load checkout items' });
        res.json({ checkout: items });
    });
};

// ✅ Confirm checkout
exports.confirmCheckout = (req, res) => {
    const { orderId, payment_method } = req.body;
    const userId = req.user.id;

    if (!orderId || !payment_method) {
        return res.status(400).json({ message: 'Order ID and payment method are required' });
    }

    const getUserAddressSql = 'SELECT address FROM users WHERE id = ? AND status="active" LIMIT 1';
    db.query(getUserAddressSql, [userId], (err, userResult) => {
        if (err) return res.status(500).json({ message: 'Failed to get user address' });
        if (userResult.length === 0 || !userResult[0].address) {
            return res.status(400).json({ message: 'User address not found or empty' });
        }

        const userAddress = userResult[0].address;

        const updateOrderSql = `
            UPDATE orders
            SET shipping_address = ?, payment_method = ?, updated_at = NOW()
            WHERE id = ? AND user_id = ?
        `;
        db.query(updateOrderSql, [userAddress, payment_method, orderId, userId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Failed to confirm order' });
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Order not found or does not belong to you' });
            }
            res.json({ message: 'Order placed successfully! Status is pending, waiting for admin confirmation.' });
        });
    });
};
