$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
        return window.location.href = "/frontend/Userhandling/login.html";
    }

    // ✅ Verify admin
    $.ajax({
        method: "GET",
        url: `http://localhost:4000/api/v1/profile/${userId}`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (res) {
            if (!res.user || res.user.role !== 'admin') {
                alert('Access denied: admin only');
                sessionStorage.clear();
                return window.location.href = "/frontend/Userhandling/login.html";
            }

            // ✅ If admin, load orders
            loadOrders();
        },
        error: function (err) {
            console.error('Failed to verify admin', err);
            sessionStorage.clear();
            window.location.href = "/frontend/Userhandling/login.html";
        }
    });

    function loadOrders() {
        $.ajax({
            url: 'http://localhost:4000/api/v1/orders',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (orders) {
                let rows = '';
                const statuses = ['Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Accepted'];

                orders.forEach((order, index) => {
                    const options = statuses.map(status =>
                        `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`
                    ).join('');

                    rows += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${order.id}</td>
                            <td>${order.user_id}</td>
                            <td>
                                <select class="statusSelect" data-id="${order.id}">
                                    ${options}
                                </select>
                            </td>
                            <td>${order.shipping_address || '-'}</td>
                            <td>${order.payment_method || '-'}</td>
                            <td>$${order.total_amount || 0}</td>
                            <td>
                                <button class="acceptBtn" data-id="${order.id}">Accept</button>
                            </td>
                        </tr>`;
                });
                $('#orderTable tbody').html(rows);
            },
            error: function (err) {
                console.error('Failed to load orders', err);
                alert('Could not load orders');
            }
        });
    }

    // Accept order → set status to 'Accepted'
    $(document).on('click', '.acceptBtn', function () {
        const orderId = $(this).data('id');
        $.ajax({
            url: `http://localhost:4000/api/v1/orders/${orderId}/accept`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function () {
                alert('Order accepted successfully (status: Accepted)');
                loadOrders();
            },
            error: function (err) {
                console.error('Failed to accept order', err);
                alert('Failed to accept order');
            }
        });
    });

    // Change status via dropdown
    $(document).on('change', '.statusSelect', function () {
        const orderId = $(this).data('id');
        const status = $(this).val();

        $.ajax({
            url: `http://localhost:4000/api/v1/orders/${orderId}/status`,
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ status }),
            success: function () {
                alert('Order status updated successfully');
                loadOrders();
            },
            error: function (err) {
                console.error('Failed to update status', err);
                alert('Failed to update status');
            }
        });
    });
});
