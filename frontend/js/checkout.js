$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const orderId = sessionStorage.getItem('pendingOrderId'); // get pending orderId

    if (!token) {
        return window.location.href = "/frontend/Userhandling/login.html";
    }

    loadCheckout();

    function loadCheckout() {
        $.ajax({
            url: 'http://localhost:4000/api/v1/checkout',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (res) {
                let rows = '';
                let total = 0;

                res.checkout.forEach((item, index) => {
                    const subtotal = item.sell_price * item.quantity;
                    total += subtotal;
                    const image = item.image ? `<img src="/frontend/images/${item.image.split(',')[0]}" width="50">` : '';

                    rows += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>$${item.sell_price}</td>
                            <td>${image}</td>
                        </tr>`;
                });

                rows += `
                    <tr>
                        <td colspan="3" style="text-align:right;"><strong>Total:</strong></td>
                        <td colspan="2"><strong>$${total.toFixed(2)}</strong></td>
                    </tr>`;
                $('#checkoutTable tbody').html(rows);
            },
            error: function (err) {
                console.error('Could not load checkout items', err);
                alert('Could not load checkout items');
            }
        });
    }

    $('#placeOrderBtn').on('click', function () {
        const shipping_address = $('#shippingAddress').val();
        const payment_method = $('#paymentMethod').val();

        if (!shipping_address || !payment_method) {
            return alert('Please enter shipping address and select payment method');
        }

        $.ajax({
            url: 'http://localhost:4000/api/v1/checkout',
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ orderId, shipping_address, payment_method }),
            success: function (res) {
                alert(res.message || 'Order confirmed!');
                sessionStorage.removeItem('pendingOrderId');
                window.location.href = "/frontend/Userhandling/home.html";
            },
            error: function (err) {
                console.error('Failed to confirm order', err);
                alert('Could not confirm order');
            }
        });
    });

    $('#backBtn').on('click', () => {
        window.location.href = "/frontend/Userhandling/home.html";
    });
});
