$(document).ready(function () {
    
    const apiUrl = 'http://localhost:4000/api/v1/users';

    function loadUsers() {
        $.get(apiUrl, function (data) {
            let rows = '';
            data.forEach((u, index) => {
                rows += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${u.name}</td>
                        <td>${u.email}</td>
                        <td>${u.contact_number || ''}</td>
                        <td>${u.address || ''}</td>
                        <td>${u.role}</td>
                        <td>${u.status}</td>
                        <td>
                            <button class="editBtn" data-id="${u.id}">Edit</button>
                        </td>
                    </tr>`;
            });
            $('#userTable tbody').html(rows);
        });
    }

    loadUsers();

    $('#userForm').on('submit', function (e) {
        e.preventDefault();

        const id = $('#userId').val();
        const user = {
            role: $('#role').val(),
            status: $('#status').val()
        };

        $.ajax({
            url: `${apiUrl}/${id}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(user),
            success: () => {
                alert('Role and status updated!');
                $('#userForm')[0].reset();
                $('#submitBtn').text('Update');
                $('#userId').val('');
                loadUsers();
            },
            error: err => alert(err.responseJSON?.error || 'Error occurred.')
        });
    });

    $(document).on('click', '.editBtn', function () {
        const id = $(this).data('id');
        $.get(`${apiUrl}/${id}`, function (u) {
            $('#userId').val(u.id);
            $('#role').val(u.role);
            $('#status').val(u.status);
            $('#submitBtn').text('Update');
        });
    });
});
