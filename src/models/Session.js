/** @format */

// /src/models/Session.js

export class Session {
	constructor({
		session_id,
		user_id,
		user_email,
		user_role,
		user_permission,
		assigned_groups = [],
		session_start = new Date().toISOString(),
		last_activity = new Date().toISOString(),
		expires_at = new Date(Date.now() + 3600 * 1000).toISOString(), // 1 hour expiry
		status = 'active',
		login_ip = '127.0.0.1',
		user_agent = 'mock-user-agent',
		jwt_token_hash,
	}) {
		this.session_id = session_id;
		this.user_id = user_id;
		this.user_email = user_email;
		this.user_role = user_role;
		this.user_permission = user_permission;
		this.assigned_groups = assigned_groups;
		this.session_start = session_start;
		this.last_activity = last_activity;
		this.expires_at = expires_at;
		this.status = status;
		this.login_ip = login_ip;
		this.user_agent = user_agent;
		this.jwt_token_hash = jwt_token_hash;
	}
}
