$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) {
        return window.location.href = "/frontend/Userhandling/login.html";
    }

    // ✅ Verify customer profile
    $.ajax({
        method: "GET",
        url: `http://localhost:4000/api/v1/profile/${userId}`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (res) {
            if (!res.user || res.user.role !== 'customer') {
                sessionStorage.clear();
                return window.location.href = "/frontend/Userhandling/login.html";
            }

            console.log(`Welcome, ${res.user.name}`);
            $("#editProfileBtn").on('click', () => {
                window.location.href = "/frontend/Userhandling/profile.html";
            });

            loadProducts();
        },
        error: function (xhr) {
            console.error("Failed to verify profile", xhr);
            sessionStorage.clear();
            window.location.href = "/frontend/Userhandling/login.html";
        }
    });

    function loadProducts() {
        $.ajax({
            url: 'http://localhost:4000/api/v1/home',
            method: 'GET',
            success: function (data) {
                let rows = '';
                data.products.forEach((product, index) => {
                    let imageDisplay = '';
                    if (product.image) {
                        const firstImage = product.image.split(',')[0];
                        imageDisplay = `<img src="/frontend/images/${firstImage}" width="50" height="50">`;
                    }

                    rows += `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${product.name}</td>
                            <td>${product.category}</td>
                            <td>${product.usage_type}</td>
                            <td>$${product.sell_price}</td>
                            <td>${product.stock}</td>
                            <td>${imageDisplay}</td>
                            <td>
                                <button class="addToCartBtn" data-id="${product.id}">Add to Cart</button>
                            </td>
                        </tr>`;
                });
                $('#productTable tbody').html(rows);

                // ⭐ Add click handler after rendering rows
                $('.addToCartBtn').on('click', function () {
                    const productId = $(this).data('id');
                    $.ajax({
                        url: 'http://localhost:4000/api/v1/cart',
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        contentType: 'application/json',
                        data: JSON.stringify({ productId: productId, quantity: 1 }),
                        success: function () {
                            alert('Product added to cart!');
                        },
                        error: function (err) {
                            console.error('Add to cart error:', err);
                            alert('Failed to add to cart');
                        }
                    });
                });
            },
            error: function (err) {
                console.error('Error loading products:', err);
                alert('Failed to load products');
            }
        });
    }

$('#checkoutSoloBtn').on('click', function() {
    const token = sessionStorage.getItem('token');
    $.ajax({
        url: 'http://localhost:4000/api/v1/checkout/solo',
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


    // 🚀 Logout
    $("#logoutBtn").on('click', () => {
        sessionStorage.clear();
        window.location.href = "/frontend/Userhandling/login.html";
    });

    $("#viewCartBtn").on('click', () => {
    window.location.href = "/frontend/Userhandling/cart.html";
});

$('#checkoutBtn').on('click', () => {
    window.location.href = "/frontend/Userhandling/checkout.html";
});
});
