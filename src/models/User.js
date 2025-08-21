// /src/models/User.js

export class User {
  constructor({
    user_id,
    email,
    password_hash,
    full_name,
    role = "team",
    permission = "Team",
    department = "General",
    status = "active",
    assigned_groups = [],
    created_at = new Date().toISOString(),
    last_login = null,
    login_count = 0,
    failed_login_attempts = 0,
    account_locked_until = null,
  }) {
    this.user_id = user_id;
    this.email = email;
    this.password_hash = password_hash; // bcrypt hashed
    this.full_name = full_name;
    this.role = role; // team, admin, super_admin
    this.permission = permission;
    this.department = department;
    this.status = status;
    this.assigned_groups = assigned_groups;
    this.created_at = created_at;
    this.last_login = last_login;
    this.login_count = login_count;
    this.failed_login_attempts = failed_login_attempts;
    this.account_locked_until = account_locked_until;
  }
}
