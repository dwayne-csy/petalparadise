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
                let total = 0; // 🧮 accumulate total price

                res.cart.forEach((item, index) => {
                    const image = item.image ? `<img src="/frontend/images/${item.image.split(',')[0]}" width="50">` : '';
                    const subtotal = item.sell_price * item.quantity;
                    total += subtotal;

                    rows += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>${image}</td>
                            <td>$${item.sell_price}</td>
                            <td><span class="quantity">${item.quantity}</span></td>
                            <td>$${subtotal.toFixed(2)}</td>
                            <td>
                                <button class="decrementBtn" data-id="${item.id}">-</button>
                                <button class="incrementBtn" data-id="${item.id}">+</button>
                                <button class="removeFromCartBtn" data-id="${item.id}">Remove</button>
                            </td>
                        </tr>`;
                });

                // Add total row at the bottom
                rows += `
                    <tr>
                        <td colspan="5" style="text-align:right"><strong>Total:</strong></td>
                        <td colspan="2"><strong>$${total.toFixed(2)}</strong></td>
                    </tr>`;

                $('#cartTable tbody').html(rows);
            },
            error: function (err) {
                console.error('Failed to load cart', err);
                alert('Could not load cart');
            }
        });
    }

    // Increment quantity
    $(document).on('click', '.incrementBtn', function () {
        const cartItemId = $(this).data('id');
        $.ajax({
            url: `http://localhost:4000/api/v1/cart/${cartItemId}/increment`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            success: loadCart,
            error: function (err) {
                console.error('Failed to increment', err);
                alert('Failed to increment quantity');
            }
        });
    });

    // Decrement quantity
    $(document).on('click', '.decrementBtn', function () {
        const cartItemId = $(this).data('id');
        $.ajax({
            url: `http://localhost:4000/api/v1/cart/${cartItemId}/decrement`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            success: loadCart,
            error: function (err) {
                console.error('Failed to decrement', err);
                alert('Failed to decrement quantity');
            }
        });
    });

    // Remove item
    $(document).on('click', '.removeFromCartBtn', function () {
        const cartItemId = $(this).data('id');
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
    });

    // Checkout cart items
$('#checkoutCartBtn').on('click', function() {
    const token = sessionStorage.getItem('token');
    $.ajax({
        url: 'http://localhost:4000/api/v1/checkout/cart',
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function(res) {
            sessionStorage.setItem('pendingOrderId', res.orderId);
            window.location.href = "/frontend/Userhandling/checkout.html";
        },
        error: function(err) {
            alert(err.responseJSON?.message || 'Failed to prepare checkout');
        }
    });
});



    // Back to home button
    $('#backBtn').click(function () {
        window.location.href = "/frontend/Userhandling/home.html";
    });
});
