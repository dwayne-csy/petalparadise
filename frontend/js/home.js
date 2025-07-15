$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) return window.location.href = "/frontend/Userhandling/login.html";

    $.ajax({
        url: `http://localhost:4000/api/v1/profile/${userId}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: res => {
            if (!res.user || res.user.role !== 'customer') {
                sessionStorage.clear();
                return window.location.href = "/frontend/Userhandling/login.html";
            }
            loadProducts();
        },
        error: () => {
            sessionStorage.clear();
            window.location.href = "/frontend/Userhandling/login.html";
        }
    });

    function loadProducts() {
        $.ajax({
            url: 'http://localhost:4000/api/v1/home',
            method: 'GET',
            success: data => {
                let products = data.products;

                // get filter values
                const search = $('#searchInput').val().toLowerCase();
                const category = $('#categoryFilter').val();
                const usage = $('#usageTypeFilter').val();
                const priceSort = $('#priceSort').val();
                const stockSort = $('#stockSort').val();

                // filter
                products = products.filter(p => {
                    return (!category || p.category === category) &&
                           (!usage || p.usage_type === usage) &&
                           (!search || p.name.toLowerCase().includes(search));
                });

                // sort
                if (priceSort) {
                    products.sort((a,b) => priceSort === 'asc' ? a.sell_price - b.sell_price : b.sell_price - a.sell_price);
                }
                if (stockSort) {
                    products.sort((a,b) => stockSort === 'high' ? b.stock - a.stock : a.stock - b.stock);
                }

                // render
                let rows = '';
                products.forEach((product, index) => {
                    const img = product.image ? `<img src="/frontend/images/${product.image.split(',')[0]}" width="50">` : '';
                    rows += `
                        <tr>
                          <td>${index+1}</td>
                          <td>${product.name}</td>
                          <td>${product.category}</td>
                          <td>${product.usage_type}</td>
                          <td>$${product.sell_price}</td>
                          <td>${product.stock}</td>
                          <td>${img}</td>
                          <td>
                            <button class="addToCartBtn" data-id="${product.id}">Add to Cart</button>
                            <button class="checkoutBtn" data-id="${product.id}">Checkout</button>
                          </td>
                        </tr>`;
                });
                $('#productTable tbody').html(rows);

                $('.addToCartBtn').click(addToCart);
                $('.checkoutBtn').click(checkoutSolo);
            },
            error: () => alert('Failed to load products')
        });
    }

    function addToCart() {
        const productId = $(this).data('id');
        $.ajax({
            url: 'http://localhost:4000/api/v1/cart',
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ productId, quantity: 1 }),
            success: () => alert('Added to cart!'),
            error: () => alert('Failed to add to cart')
        });
    }

    function checkoutSolo() {
        const productId = $(this).data('id');
        $.ajax({
            url: 'http://localhost:4000/api/v1/checkout/solo',
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ productId, quantity: 1 }),
            success: res => {
                sessionStorage.setItem('pendingOrderId', res.orderId);
                window.location.href = "/frontend/Userhandling/checkout.html";
            },
            error: err => alert(err.responseJSON?.message || 'Checkout failed')
        });
    }

    $('#applyFiltersBtn').click(loadProducts);
    $("#logoutBtn").click(() => { sessionStorage.clear(); window.location.href = "/frontend/Userhandling/login.html"; });
    $("#viewCartBtn").click(() => window.location.href = "/frontend/Userhandling/cart.html");
});
