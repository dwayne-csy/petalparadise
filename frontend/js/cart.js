$(document).ready(function () {
    const token = sessionStorage.getItem('token');

    if (!token) {
        return window.location.href = "/frontend/Userhandling/login.html";
    }

    loadCart();

    function loadCart() {
        $.ajax({
            url: 'http://localhost:4000/api/v1/cart',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (res) {
                let rows = '';
                res.cart.forEach((item, index) => {
                    const image = item.image ? `<img src="/frontend/images/${item.image.split(',')[0]}" width="50">` : '';
                    rows += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>$${item.sell_price}</td>
                            <td>${item.quantity}</td>
                            <td>${image}</td>
                            <td>
                                <button class="decrementBtn" data-id="${item.id}">-</button>
                                <button class="incrementBtn" data-id="${item.id}">+</button>
                                <button class="removeFromCartBtn" data-id="${item.id}">Remove</button>
                            </td>
                        </tr>`;
                });
                $('#cartTable tbody').html(rows);
            },
            error: function (err) {
                console.error('Failed to load cart', err);
                alert('Could not load cart');
            }
        });
    }

    // 🟩 Increment quantity
    $(document).on('click', '.incrementBtn', function () {
        const cartItemId = $(this).data('id');
        $.ajax({
            url: `http://localhost:4000/api/v1/cart/${cartItemId}/increment`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function () {
                loadCart();
            },
            error: function (err) {
                console.error('Failed to increment', err);
                alert('Failed to increment quantity');
            }
        });
    });

    // 🟥 Decrement quantity
    $(document).on('click', '.decrementBtn', function () {
        const cartItemId = $(this).data('id');
        $.ajax({
            url: `http://localhost:4000/api/v1/cart/${cartItemId}/decrement`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function () {
                loadCart();
            },
            error: function (err) {
                console.error('Failed to decrement', err);
                alert('Failed to decrement quantity');
            }
        });
    });

    // 🗑 Remove item from cart
    $(document).on('click', '.removeFromCartBtn', function () {
        const cartItemId = $(this).data('id');
        removeFromCart(cartItemId);
    });

    function removeFromCart(cartItemId) {
        $.ajax({
            url: `http://localhost:4000/api/v1/cart/${cartItemId}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function () {
                alert('Item removed');
                loadCart();
            },
            error: function (err) {
                console.error('Failed to remove item', err);
                alert('Could not remove item');
            }
        });
    }
});
