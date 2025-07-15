$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const orderId = sessionStorage.getItem('pendingOrderId');

    if (!token || !orderId) {
        alert("No pending order found. Please checkout first.");
        return window.location.href = "/frontend/Userhandling/home.html";
    }

    // Load checkout details
    $.ajax({
        url: 'http://localhost:4000/api/v1/checkout',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (res) {
            const checkout = res.checkout;
            if (!checkout || !checkout.length) {
                alert('No checkout items found.');
                return window.location.href = "/frontend/Userhandling/home.html";
            }

            // ✅ Show user address immediately
            if (res.userAddress) {
                $('#userAddress').text(res.userAddress);
            } else {
                $('#userAddress').text('Address not found');
            }

            let rows = '';
            let total = 0;
            checkout.forEach((item, index) => {
                total += Number(item.price) * item.quantity;
                const image = item.image 
                    ? `<img src="/frontend/images/${item.image.split(',')[0]}" width="50" height="50" />`
                    : '';
                rows += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.price}</td>
                        <td>${image}</td>
                    </tr>
                `;
            });

            $('#checkoutTable tbody').html(rows);
            $('#totalAmount').text(`$${total.toFixed(2)}`);
        },
        error: function (err) {
            console.error('Failed to load checkout details:', err);
            alert(err.responseJSON?.message || 'Could not load checkout details.');
            window.location.href = "/frontend/Userhandling/home.html";
        }
    });

    // Confirm checkout
    $('#confirmCheckoutBtn').on('click', function () {
        $.ajax({
            url: 'http://localhost:4000/api/v1/checkout/confirm',
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ orderId }),
            success: function (res) {
                alert(res.message);
                sessionStorage.removeItem('pendingOrderId');
                window.location.href = "/frontend/Userhandling/home.html";
            },
            error: function (err) {
                console.error('Failed to confirm checkout:', err);
                alert(err.responseJSON?.message || 'Could not confirm order.');
            }
        });
    });

    // Cancel
    $('#cancelCheckoutBtn').on('click', function () {
        sessionStorage.removeItem('pendingOrderId');
        window.location.href = "/frontend/Userhandling/home.html";
    });
});
