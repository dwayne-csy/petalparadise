$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');

    if (!token || !userId) return window.location.href = "/frontend/Userhandling/login.html";

    let allProducts = []; // Store all products for filtering
    let currentUser = null; // Store current user data

    // Verify customer and load initial data
    $.ajax({
        url: `http://localhost:4000/api/v1/profile/${userId}`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        success: res => {
            if (!res.user || res.user.role !== 'customer') {
                sessionStorage.clear();
                return window.location.href = "/frontend/Userhandling/login.html";
            }
            currentUser = res.user;
            // Update customer name in the UI
            updateCustomerName(currentUser.name);
            loadProducts();
            loadCartCount(); // Load initial cart count
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
            headers: { 'Authorization': `Bearer ${token}` },
            success: data => {
                allProducts = data.products || [];
                applyFilters(); // Apply filters after loading products
            },
            error: () => {
                alert('Failed to load products');
                console.error('Failed to load products');
            }
        });
    }

    function applyFilters() {
        let filteredProducts = [...allProducts];

        // Get current filter values
        const search = $('#searchInput').val().toLowerCase().trim();
        const category = $('#categoryFilter').val();
        const usage = $('#usageTypeFilter').val();
        const priceSort = $('#priceSort').val();
        const stockSort = $('#stockSort').val();

        // Apply text search filter
        if (search) {
            filteredProducts = filteredProducts.filter(product => 
                product.name.toLowerCase().includes(search) ||
                product.category.toLowerCase().includes(search) ||
                product.usage_type.toLowerCase().includes(search)
            );
        }

        // Apply category filter
        if (category) {
            filteredProducts = filteredProducts.filter(product => 
                product.category === category
            );
        }

        // Apply usage type filter
        if (usage) {
            filteredProducts = filteredProducts.filter(product => 
                product.usage_type === usage
            );
        }

        // Apply price sorting
        if (priceSort) {
            filteredProducts.sort((a, b) => {
                const priceA = parseFloat(a.sell_price) || 0;
                const priceB = parseFloat(b.sell_price) || 0;
                return priceSort === 'asc' ? priceA - priceB : priceB - priceA;
            });
        }

        // Apply stock sorting
        if (stockSort) {
            filteredProducts.sort((a, b) => {
                const stockA = parseInt(a.stock) || 0;
                const stockB = parseInt(b.stock) || 0;
                return stockSort === 'high' ? stockB - stockA : stockA - stockB;
            });
        }

        renderProducts(filteredProducts);
    }

    function renderProducts(products) {
        let cards = '';
        
        if (products.length === 0) {
            cards = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #880e4f;">
                    <h3>🌸 No products found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>
            `;
        } else {
            products.forEach(product => {
                const imgTag = product.image
                    ? `<img src="/frontend/images/${product.image.split(',')[0]}" alt="${product.name}" onerror="this.style.display='none'">`
                    : '<div style="height: 160px; background: #f8bbd0; display: flex; align-items: center; justify-content: center; border-radius: 15px; color: #880e4f;">No Image</div>';

                const stock = parseInt(product.stock) || 0;
                const isOutOfStock = stock === 0;

                cards += `
                    <div class="product-card ${isOutOfStock ? 'out-of-stock' : ''}" data-product-id="${product.id}">
                        ${imgTag}
                        <h4>${product.name}</h4>
                        <p><strong>Category:</strong> ${product.category}</p>
                        <p><strong>Usage:</strong> ${product.usage_type}</p>
                        <p><strong>Price:</strong> ₱${parseFloat(product.sell_price).toFixed(2)}</p>
                        <p><strong>Stock:</strong> ${stock} ${stock === 1 ? 'item' : 'items'}</p>
                        ${isOutOfStock ? 
                            '<p style="color: #ff4444; font-weight: bold;">Out of Stock</p>' : 
                            `<button class="addToCartBtn" data-id="${product.id}">Add to Cart</button>
                             <button class="checkoutBtn" data-id="${product.id}">Checkout</button>`
                        }
                    </div>`;
            });
        }

        $('#productContainer').html(cards);
        
        // Reattach event listeners
        $('.addToCartBtn').off('click').on('click', addToCart);
        $('.checkoutBtn').off('click').on('click', checkoutSolo);
    }

    function addToCart() {
        const productId = $(this).data('id');
        const button = $(this);
        
        // Disable button during request
        button.prop('disabled', true).text('Adding...');
        
        $.ajax({
            url: 'http://localhost:4000/api/v1/cart',
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            contentType: 'application/json',
            data: JSON.stringify({ productId, quantity: 1 }),
            success: () => {
                alert('Added to cart!');
                loadCartCount(); // Update cart count
                button.prop('disabled', false).text('Add to Cart');
            },
            error: (xhr) => {
                const errorMsg = xhr.responseJSON?.message || 'Failed to add to cart';
                alert(errorMsg);
                button.prop('disabled', false).text('Add to Cart');
            }
        });
    }

    function checkoutSolo() {
    const productId = $(this).data('id');
    const button = $(this);
    
    // Disable button during request
    button.prop('disabled', true).text('Processing...');
    
    $.ajax({
        url: 'http://localhost:4000/api/v1/checkout/solo',
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        contentType: 'application/json',
        data: JSON.stringify({ productId, quantity: 1 }),
        success: res => {
            // Store product data instead of orderId
            sessionStorage.setItem('checkoutType', 'solo');
            sessionStorage.setItem('checkoutProduct', JSON.stringify(res.product));
            window.location.href = "/frontend/Userhandling/checkout.html";
        },
        error: err => {
            const errorMsg = err.responseJSON?.message || 'Checkout failed';
            alert(errorMsg);
            button.prop('disabled', false).text('Checkout');
        }
    });
}

    function loadCartCount() {
        $.ajax({
            url: 'http://localhost:4000/api/v1/cart/count',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: (data) => {
                updateCartCount(data.count || 0);
            },
            error: () => {
                updateCartCount(0);
            }
        });
    }

    // Auto-apply filters when any filter input changes
    $('#searchInput').on('input', function() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            applyFilters();
        }, 300); // Debounce search for 300ms
    });

    $('#categoryFilter, #usageTypeFilter, #priceSort, #stockSort').on('change', function() {
        applyFilters();
    });

    // Clear all filters
    function clearFilters() {
        $('#searchInput').val('');
        $('#categoryFilter').val('');
        $('#usageTypeFilter').val('');
        $('#priceSort').val('');
        $('#stockSort').val('');
        applyFilters();
    }

    // Add clear filters button functionality (if you want to add this later)
    $('#clearFiltersBtn').on('click', clearFilters);

    // Navigation event handlers
    $("#logoutBtn").click(() => {
        sessionStorage.clear();
        window.location.href = "/frontend/Userhandling/login.html";
    });

    $("#viewCartBtn").click(() => {
        window.location.href = "/frontend/Userhandling/cart.html";
    });

    $("#editProfileBtn").click(() => {
        window.location.href = "/frontend/Userhandling/profile.html";
    });

    // Remove the old apply filters button click handler since we're using automatic filtering
    // $('#applyFiltersBtn').click(loadProducts); // Removed this line

    // Refresh products periodically (optional)
    setInterval(function() {
        if (document.visibilityState === 'visible') {
            loadProducts();
        }
    }, 30000); // Refresh every 30 seconds when page is visible
});

// Global functions that can be called from HTML
function updateCustomerName(customerName) {
    if (customerName) {
        $("#welcomeText").text(`Welcome, ${customerName}!`);
        // Also update the user avatar with first letter
        const firstLetter = customerName.charAt(0).toUpperCase();
        $(".user-avatar").text(firstLetter);
    }
}

function updateCartCount(count) {
    $("#cartCount").text(count || 0);
    // Optional: Hide cart count if zero
    if (count > 0) {
        $("#cartCount").show();
    } else {
        $("#cartCount").hide();
    }
}