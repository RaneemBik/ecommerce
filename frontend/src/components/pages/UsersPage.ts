export function renderUsers(container: HTMLElement) {
  container.innerHTML = `
    <h1 class="page-title">Users</h1>
    <p class="page-subtitle">Manage your users, roles and permissions.</p>

    <div class="panel">
      <div class="panel__header"><h3 class="panel__title">All users</h3><button class="panel__action">Invite</button></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
          <tbody>
            <tr><td>Sarah Chen</td><td>sarah@example.com</td><td>Admin</td></tr>
            <tr><td>Mike Ross</td><td>mike@example.com</td><td>Member</td></tr>
            <tr><td>Emily Park</td><td>emily@example.com</td><td>Editor</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
