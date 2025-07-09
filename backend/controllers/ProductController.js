const connection = require('../config/db');

exports.createProduct = (req, res) => {
    const {
        name, category, usage_type, description,
        cost_price, sell_price, color, stock, supplier_id
    } = req.body;

    const image = req.file ? req.file.filename : null;

    const sql = `
        INSERT INTO products (name, category, usage_type, description, cost_price, sell_price, color, stock, image, supplier_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    connection.query(sql, [
        name, category, usage_type, description,
        cost_price, sell_price, color, stock, image, supplier_id
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: 'Product added', id: result.insertId });
    });
};

exports.getProducts = (req, res) => {
    connection.query('SELECT * FROM products', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
};

exports.getProductById = (req, res) => {
    const { id } = req.params;
    connection.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ message: 'Not found' });
        res.json(results[0]);
    });
};

exports.updateProduct = (req, res) => {
    const { id } = req.params;
    const {
        name, category, usage_type, description,
        cost_price, sell_price, color, stock, supplier_id
    } = req.body;

    let sql = `
        UPDATE products SET
            name = ?, category = ?, usage_type = ?, description = ?,
            cost_price = ?, sell_price = ?, color = ?, stock = ?, supplier_id = ?
    `;
    const params = [name, category, usage_type, description, cost_price, sell_price, color, stock, supplier_id];

    if (req.file) {
        sql += `, image = ?`;
        params.push(req.file.filename);
    }

    sql += ` WHERE id = ?`;
    params.push(id);

    connection.query(sql, params, (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Product updated' });
    });
};

exports.deleteProduct = (req, res) => {
    const { id } = req.params;
    connection.query('DELETE FROM products WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Not found' });
        res.json({ message: 'Product deleted' });
    });
};
