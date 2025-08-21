/** @format */

// src/app/api/auth/login/route.js
import { NextResponse } from 'next/server';
import {
	mockUsers,
	mockGroups,
	mockAdminDashboard,
	buildSession,
} from '@/app/lib/mockdb';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET = 'supersecret'; // for mock only

// --- helpers ---
function generateToken(payload) {
	return jwt.sign(payload, SECRET, { expiresIn: '1h' });
}

function buildAssignedGroups(user) {
	return user.assigned_groups
		.map((gid) => {
			const group = mockGroups.find((g) => g.group_id === gid);
			if (!group) return null;

			return {
				group_id: group.group_id,
				group_name: group.group_name,
				access_level: group.access_level_map[user.role] || 'member', // safe fallback
				member_count: group.member_count,
				project_count: group.project_count,
			};
		})
		.filter(Boolean);
}

// error responses
function invalidCredentialsResponse(failedAttempts = 1, maxAttempts = 5) {
	return NextResponse.json(
		{
			success: false,
			error: 'Invalid email or password',
			error_code: 'INVALID_CREDENTIALS',
			retry_allowed: true,
			failed_attempts: failedAttempts,
			max_attempts: maxAttempts,
			frontend_action: 'show_error_message',
		},
		{ status: 401 }
	);
}

function accountLockedResponse(lockedUntil) {
	return NextResponse.json(
		{
			success: false,
			error: 'Account temporarily locked due to multiple failed login attempts',
			error_code: 'ACCOUNT_LOCKED',
			locked_until: lockedUntil,
			retry_allowed: false,
			frontend_action: 'show_lockout_message',
		},
		{ status: 403 }
	);
}

// --- main login response ---
function buildLoginResponse(user) {
	const session = buildSession(user);

	// Admin
	if (user.role === 'admin') {
		return NextResponse.json({
			success: true,
			user: {
				user_id: user.user_id,
				email: user.email,
				full_name: user.full_name,
				role: user.role,
				permission: user.permission,
				department: user.department,
				last_login: user.last_login,
				login_count: user.login_count,
			},
			session,
			dashboard_route: 'admin',
			frontend_action: 'show_admin_dashboard',
			assigned_groups: buildAssignedGroups(user),
		});
	}

	// Super Admin
	if (user.role === 'super_admin') {
		return NextResponse.json({
			success: true,
			user: {
				user_id: user.user_id,
				email: user.email,
				full_name: user.full_name,
				role: user.role,
				permission: user.permission,
				department: user.department,
				last_login: user.last_login,
				login_count: user.login_count,
			},
			session,
			dashboard_route: 'admin',
			frontend_action: 'show_admin_dashboard',
			assigned_groups: buildAssignedGroups(user),
			admin_dashboard: user.role === 'super_admin' ? mockAdminDashboard : null,
		});
	}

	// Team Member
	if (user.role === 'team') {
		return NextResponse.json({
			success: true,
			user: {
				user_id: user.user_id,
				email: user.email,
				full_name: user.full_name,
				role: user.role,
				permission: user.permission,
				department: user.department,
				last_login: user.last_login,
				login_count: user.login_count,
			},
			session,
			dashboard_route: 'groups',
			frontend_action: 'show_groups_directly',
			assigned_groups: buildAssignedGroups(user),
			admin_dashboard: null,
		});
	}
}

// --- route handler ---
export async function POST(req) {
	try {
		const { email, password } = await req.json();
		// console.log(email, password);

		const user = mockUsers.find((u) => u.email === email);
		// console.log(user.password_hash);

		if (!user) return invalidCredentialsResponse();

		// mock lock check
		if (
			user.account_locked_until &&
			new Date(user.account_locked_until) > new Date()
		) {
			return accountLockedResponse(user.account_locked_until);
		}

		// 3. Validate password against hash
		const isPasswordValid = await bcrypt.compare(password, user.password_hash);

		// mock password check
		if (!isPasswordValid) {
			user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
			// console.log(user.password_hash);
			if (user.failed_login_attempts >= 5) {
				user.account_locked_until = new Date(
					Date.now() + 30 * 60 * 1000
				).toISOString();
				return accountLockedResponse(user.account_locked_until);
			}

			return invalidCredentialsResponse(user.failed_login_attempts);
		}

		// reset failed attempts on success
		user.failed_login_attempts = 0;
		user.last_login = new Date().toISOString();
		user.login_count += 1;

		return buildLoginResponse(user);
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: 'Server error', details: err.message },
			{ status: 500 }
		);
	}
}
