const db = require('../config/db');

// Solo checkout: create pending order, add items, then decrease stock
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

        const createOrderSql = 'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES (?, "pending", NOW(), NOW())';
        db.query(createOrderSql, [userId], (err, orderResult) => {
            if (err) {
                console.error('Failed to create order:', err);
                return res.status(500).json({ message: 'Failed to create order' });
            }
            const orderId = orderResult.insertId;

            const insertItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) VALUES ?';
            const values = soloProducts.map(prod => [orderId, prod.id, 1, prod.sell_price, new Date(), new Date()]);
            db.query(insertItemsSql, [values], (err) => {
                if (err) {
                    console.error('Failed to insert order_items:', err);
                    return res.status(500).json({ message: 'Failed to add order items' });
                }

                // ✅ Now update stock: decrease by 1 for each product
                const stockUpdates = soloProducts.map(prod => {
                    return new Promise((resolve, reject) => {
                        db.query('UPDATE products SET stock = stock - 1 WHERE id = ?', [prod.id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });

                Promise.all(stockUpdates)
                .then(() => {
                    res.json({ message: 'Solo checkout prepared', orderId });
                })
                .catch(err => {
                    console.error('Failed to update stock:', err);
                    res.status(500).json({ message: 'Failed to update product stock' });
                });
            });
        });
    });
};

// Cart checkout: create pending order, add items, then decrease stock
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

        const createOrderSql = 'INSERT INTO orders (user_id, status, created_at, updated_at) VALUES (?, "pending", NOW(), NOW())';
        db.query(createOrderSql, [userId], (err, orderResult) => {
            if (err) {
                console.error('Failed to create order:', err);
                return res.status(500).json({ message: 'Failed to create order' });
            }
            const orderId = orderResult.insertId;

            const insertItemsSql = 'INSERT INTO order_items (order_id, product_id, quantity, price, created_at, updated_at) VALUES ?';
            const values = cartItems.map(item => [orderId, item.product_id, item.quantity, item.sell_price, new Date(), new Date()]);
            db.query(insertItemsSql, [values], (err) => {
                if (err) {
                    console.error('Failed to insert order_items:', err);
                    return res.status(500).json({ message: 'Failed to add order items' });
                }

                // ✅ Now update stock: decrease stock by quantity
                const stockUpdates = cartItems.map(item => {
                    return new Promise((resolve, reject) => {
                        db.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                });

                Promise.all(stockUpdates)
                .then(() => {
                    // Clear cart after stock update
                    db.query('DELETE FROM cart_items WHERE user_id = ?', [userId], (err) => {
                        if (err) {
                            console.error('Failed to clear cart:', err);
                            return res.status(500).json({ message: 'Checked out but failed to clear cart' });
                        }
                        res.json({ message: 'Cart checkout prepared', orderId });
                    });
                })
                .catch(err => {
                    console.error('Failed to update stock:', err);
                    res.status(500).json({ message: 'Failed to update product stock' });
                });
            });
        });
    });
};

// getCheckoutDetails and confirmCheckout stay the same, as you already have them clean


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
// Confirm checkout: automatically use user's address as shipping_address, update order to 'confirmed'
// Confirm checkout: set payment_method & shipping_address, keep status 'pending'
exports.confirmCheckout = (req, res) => {
    const { orderId, payment_method } = req.body;
    const userId = req.user.id;

    if (!orderId || !payment_method) {
        return res.status(400).json({ message: 'Order ID and payment method are required' });
    }

    // Step 1: get user's address
    const getUserAddressSql = 'SELECT address FROM users WHERE id = ? AND status="active" LIMIT 1';
    db.query(getUserAddressSql, [userId], (err, userResult) => {
        if (err) {
            console.error('Failed to get user address:', err);
            return res.status(500).json({ message: 'Failed to get user address' });
        }
        if (userResult.length === 0 || !userResult[0].address) {
            return res.status(400).json({ message: 'User address not found or empty' });
        }

        const userAddress = userResult[0].address;

        // Step 2: update payment_method and shipping_address, but keep status as 'pending'
        const updateOrderSql = `
            UPDATE orders
            SET shipping_address = ?,
                payment_method = ?,
                updated_at = NOW()
            WHERE id = ? AND user_id = ?
        `;
        db.query(updateOrderSql, [userAddress, payment_method, orderId, userId], (err, result) => {
            if (err) {
                console.error('Failed to update order:', err);
                return res.status(500).json({ message: 'Failed to update order' });
            }
            if (result.affectedRows === 0) {
                return res.status(400).json({ message: 'Order not found or does not belong to you' });
            }

            res.json({ message: 'Order placed successfully! Status is pending, waiting for admin confirmation.' });
        });
    });
};
