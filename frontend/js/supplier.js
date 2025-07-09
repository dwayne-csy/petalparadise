$(document).ready(function () {
    const apiUrl = 'http://localhost:4000/api/v1/supplier';

    function loadSuppliers() {
        $.get(apiUrl, function (data) {
            let rows = '';
            data.forEach((supplier, index) => {
                rows += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${supplier.supplier_name}</td>
                        <td>${supplier.email}</td>
                        <td>${supplier.phone || ''}</td>
                        <td>${supplier.address || ''}</td>
                        <td>
                            <button class="editBtn" data-id="${supplier.id}">Edit</button>
                            <button class="deleteBtn" data-id="${supplier.id}">Delete</button>
                        </td>
                    </tr>`;
            });
            $('#supplierTable tbody').html(rows);
        });
    }

    loadSuppliers();

    $('#supplierForm').on('submit', function (e) {
        e.preventDefault();

        const id = $('#supplierId').val();
        const supplier = {
            supplier_name: $('#supplier_name').val(),
            email: $('#email').val(),
            phone: $('#phone').val(),
            address: $('#address').val()
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${apiUrl}/${id}` : apiUrl;

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(supplier),
            success: () => {
                alert(id ? "Updated!" : "Added!");
                $('#supplierForm')[0].reset();
                $('#submitBtn').text("Add Supplier");
                $('#supplierId').val('');
                loadSuppliers();
            },
            error: err => alert(err.responseJSON?.error || "Error occurred.")
        });
    });

    $(document).on('click', '.editBtn', function () {
        const id = $(this).data('id');
        $.get(`${apiUrl}/${id}`, function (supplier) {
            $('#supplierId').val(supplier.id);
            $('#supplier_name').val(supplier.supplier_name);
            $('#email').val(supplier.email);
            $('#phone').val(supplier.phone);
            $('#address').val(supplier.address);
            $('#submitBtn').text("Update Supplier");
        });
    });

    $(document).on('click', '.deleteBtn', function () {
        const id = $(this).data('id');
        if (confirm('Are you sure you want to delete this supplier?')) {
            $.ajax({
                url: `${apiUrl}/${id}`,
                method: 'DELETE',
                success: () => {
                    alert("Deleted!");
                    loadSuppliers();
                }
            });
        }
    });
});
