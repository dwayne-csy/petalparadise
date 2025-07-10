$(document).ready(function () {
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const productApi = 'http://localhost:4000/api/v1/product';
    const supplierApi = 'http://localhost:4000/api/v1/supplier';

    // Check authentication
    if (!token || !userId) {
        sessionStorage.clear();
        window.location.href = "/frontend/Userhandling/login.html";
        return;
    }

    // Check admin status and load data
    $.ajax({
        method: "GET",
        url: `http://localhost:4000/api/v1/profile/${userId}`,
        headers: { 'Authorization': `Bearer ${token}` },
        success: function (res) {
            if (res.user.role !== 'admin') {
                sessionStorage.clear();
                window.location.href = "/frontend/Userhandling/home.html";
                return;
            }
            loadProducts();
            loadSuppliers();
        },
        error: function () {
            sessionStorage.clear();
            window.location.href = "/frontend/Userhandling/login.html";
        }
    });

    function loadSuppliers() {
        $.ajax({
            url: supplierApi,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (data) {
                let options = '<option value="">-- Supplier (Optional) --</option>';
                data.forEach(supplier => {
                    options += `<option value="${supplier.id}">${supplier.supplier_name}</option>`;
                });
                $('#supplier_id').html(options);
            },
            error: function () {
                alert('Failed to load suppliers');
            }
        });
    }

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

            // ⭐ Add click handler for Add to Cart buttons
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
    // Handle form submission
    $('#productForm').submit(function (e) {
        e.preventDefault();
        const formData = new FormData(this);
        const productId = $('#productId').val();
        const isEdit = !!productId;

        // Log form data for debugging
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
        }

        $.ajax({
            url: isEdit ? `${productApi}/${productId}` : productApi,
            method: isEdit ? 'PUT' : 'POST',
            data: formData,
            processData: false,
            contentType: false,
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (response) {
                alert(isEdit ? 'Product updated successfully!' : 'Product added successfully!');
                $('#productForm')[0].reset();
                $('#productId').val('');
                $('#submitBtn').text('Add Product');
                loadProducts();
            },
            error: function (err) {
                console.error('Error:', err);
                let errorMsg = 'Operation failed. Please try again.';
                if (err.responseJSON && err.responseJSON.error) {
                    errorMsg = err.responseJSON.error;
                    if (err.responseJSON.details) {
                        errorMsg += ` (${err.responseJSON.details})`;
                    }
                }
                alert(errorMsg);
            }
        });
    });

    // Edit product
    $(document).on('click', '.editBtn', function () {
        const productId = $(this).data('id');
        $.ajax({
            url: `${productApi}/${productId}`,
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function (product) {
                // Fill form with product data
                $('#productId').val(product.id);
                $('#name').val(product.name);
                $('#category').val(product.category);
                $('#usage_type').val(product.usage_type);
                $('#description').val(product.description);
                $('#cost_price').val(product.cost_price);
                $('#sell_price').val(product.sell_price);
                $('#color').val(product.color);
                $('#stock').val(product.stock);
                $('#supplier_id').val(product.supplier_id);
                $('#submitBtn').text('Update Product');
                
                // Scroll to form
                $('html, body').animate({
                    scrollTop: $('#productForm').offset().top
                }, 500);
            },
            error: function (err) {
                console.error('Error loading product:', err);
                alert('Failed to load product details');
            }
        });
    });

    // Delete product
    $(document).on('click', '.deleteBtn', function () {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        const productId = $(this).data('id');
        $.ajax({
            url: `${productApi}/${productId}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
            success: function () {
                alert('Product deleted successfully');
                loadProducts();
            },
            error: function (err) {
                console.error('Error deleting product:', err);
                alert('Failed to delete product');
            }
        });
    });
});