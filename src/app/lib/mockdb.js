/** @format */

import bcrypt from 'bcryptjs';

// Pre-hash a password for all test users
const passwordHash = bcrypt.hashSync('SecurePass123', 10);

export let mockSessions = [];

export function buildSession(user) {
	const session = {
		session_id: `sess-${Date.now()}/${user.user_id.split('/')[1]}`,
		user_id: user.user_id,
		token: `mock_token_${user.role}_${Date.now()}`,
		expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
		refresh_token: `${user.role}_refresh_token`,
	};

	mockSessions.push(session);
	return session;
}

export function removeSession(session_id) {
	mockSessions = mockSessions.filter((s) => s.session_id !== session_id);
}

// ---------------- ADMIN DASHBOARD ----------------
export const mockAdminDashboard = {
	available_sections: [
		{
			name: 'Groups',
			enabled: true,
			action: 'navigate_to_groups',
		},
		{
			name: 'I AM (Admin Console)',
			enabled: false,
			reason: 'Feature not implemented',
		},
		{
			name: 'Identity & Organization',
			enabled: false,
			reason: 'Feature not implemented',
		},
	],
};

// ---------------- USERS ----------------
export const mockUsers = [
	{
		user_id: 'PGM-346789/AY',
		email: 'amit.yadav@elementzerolabs.com',
		password_hash: passwordHash,
		full_name: 'Amit Yadav',
		role: 'admin',
		permission: 'Admin',
		department: 'Automation Engineer',
		status: 'active',
		assigned_groups: ['DGP/1-893267/MK', 'DGP/2-891316/MK', 'DGP/3-891134/MK'],
		created_at: '2025-01-01T00:00:00Z',
		last_login: '2024-12-31T08:15:00Z',
		login_count: 15,
		failed_login_attempts: 0,
		account_locked_until: null,
	},
	{
		user_id: 'PGM-344722/MK',
		email: 'mikeal@electricoctopus.agency',
		password_hash: passwordHash,
		full_name: 'Mikeal Kayanian',
		role: 'super_admin',
		permission: 'Super Admin',
		department: 'Founder/Super Admin',
		status: 'active',
		assigned_groups: ['DGP/1-893267/MK', 'DGP/2-891316/MK', 'DGP/3-891134/MK'],
		created_at: '2025-01-01T00:00:00Z',
		last_login: '2024-12-31T09:30:00Z',
		login_count: 25,
		failed_login_attempts: 0,
		account_locked_until: null,
	},
	{
		user_id: 'PGM-349877/AB',
		email: 'amir@apostlefund.xyz',
		password_hash: passwordHash,
		full_name: 'Amir Bershad',
		role: 'team',
		permission: 'Team',
		department: 'Social Media Lead',
		status: 'active',
		assigned_groups: ['DGP/1-893267/MK'],
		created_at: '2025-01-01T00:00:00Z',
		last_login: '2024-12-30T14:20:00Z',
		login_count: 8,
		failed_login_attempts: 0,
		account_locked_until: null,
	},
	{
		user_id: 'PGM-360001/EF',
		email: 'eric@paradigmcorp.com',
		password_hash: passwordHash,
		full_name: 'Eric Frost',
		role: 'team',
		permission: 'Team',
		department: 'QA Tester',
		status: 'active',
		assigned_groups: ['DGP/3-891134/MK'],
		created_at: '2025-01-01T00:00:00Z',
		last_login: '2024-12-28T10:00:00Z',
		login_count: 3,
		failed_login_attempts: 5,
		account_locked_until: '2025-01-01T11:00:00Z',
	},
];

// ---------------- GROUPS ----------------
export const mockGroups = [
	{
		group_id: 'DGP/1-893267/MK',
		group_name: 'Paradigm/Dev-Group-1',
		access_level_map: {
			admin: 'admin',
			super_admin: 'super_admin',
			team: 'member',
		},
		member_count: 3,
		project_count: 2,
	},
	{
		group_id: 'DGP/2-891316/MK',
		group_name: 'Paradigm/Dev-Group-2',
		access_level_map: {
			admin: 'admin',
			super_admin: 'super_admin',
			team: 'member',
		},
		member_count: 2,
		project_count: 1,
	},
];
