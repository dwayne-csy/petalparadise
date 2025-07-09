$(document).ready(function () {
    const productApi = 'http://localhost:4000/api/v1/product';
    const supplierApi = 'http://localhost:4000/api/v1/supplier';

    loadProducts();
    loadSuppliers();

    function loadSuppliers() {
        $.get(supplierApi, function (data) {
            let options = `<option value="">-- Supplier (Optional) --</option>`;
            data.forEach(supplier => {
                options += `<option value="${supplier.id}">${supplier.supplier_name}</option>`;
            });
            $('#supplier_id').html(options);
        });
    }

    function loadProducts() {
        $.get(productApi, function (data) {
            let rows = '';
            data.forEach((p, i) => {
                const imageTag = p.image ? `<img src="http://localhost:4000/uploads/${p.image}" width="50" height="50">` : '';
                rows += `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>${p.usage_type}</td>
                        <td>${p.sell_price}</td>
                        <td>${p.stock}</td>
                        <td>${imageTag}</td>
                        <td>${p.supplier_id || ''}</td>
                        <td>
                            <button class="editBtn" data-id="${p.id}">Edit</button>
                            <button class="deleteBtn" data-id="${p.id}">Delete</button>
                        </td>
                    </tr>`;
            });
            $('#productTable tbody').html(rows);
        });
    }

    $('#productForm').submit(function (e) {
        e.preventDefault();

        const id = $('#productId').val();
        const formData = new FormData(this);

        const url = id ? `${productApi}/${id}` : productApi;
        const method = id ? 'PUT' : 'POST';

        $.ajax({
            url,
            method,
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert(id ? 'Product updated!' : 'Product added!');
                $('#productForm')[0].reset();
                $('#productId').val('');
                $('#submitBtn').text('Add Product');
                loadProducts();
            },
            error: function (err) {
                alert('Error: ' + (err.responseJSON?.error || 'Upload failed'));
            }
        });
    });

    $(document).on('click', '.editBtn', function () {
        const id = $(this).data('id');
        $.get(`${productApi}/${id}`, function (p) {
            $('#productId').val(p.id);
            $('#name').val(p.name);
            $('#category').val(p.category);
            $('#usage_type').val(p.usage_type);
            $('#description').val(p.description);
            $('#cost_price').val(p.cost_price);
            $('#sell_price').val(p.sell_price);
            $('#color').val(p.color);
            $('#stock').val(p.stock);
            $('#supplier_id').val(p.supplier_id);
            $('#submitBtn').text('Update Product');
        });
    });

    $(document).on('click', '.deleteBtn', function () {
        const id = $(this).data('id');
        if (confirm('Delete this product?')) {
            $.ajax({
                url: `${productApi}/${id}`,
                method: 'DELETE',
                success: function () {
                    alert('Product deleted!');
                    loadProducts();
                }
            });
        }
    });
});
