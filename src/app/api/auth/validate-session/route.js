/** @format */

import { NextResponse } from 'next/server';
import { mockUsers } from '@/app/lib/mockdb';

// --- Ensure global mockSessions exists ---
if (!global.mockSessions) {
	global.mockSessions = [];
}

// --- Error Response Helper ---
function invalidSessionResponse() {
	return NextResponse.json(
		{
			valid: false,
			error: 'Invalid or expired session',
			error_code: 'INVALID_SESSION',
			frontend_action: 'redirect_to_login',
		},
		{ status: 401 }
	);
}

// --- Format time remaining helper ---
function formatTimeRemaining(ms) {
	const totalMinutes = Math.floor(ms / (1000 * 60));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	return `${hours}h ${minutes}m`;
}

// --- API Route ---
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const session_id = searchParams.get('session_id');

		if (!session_id) return invalidSessionResponse();

		// 1. Find session in global
		const session = global.mockSessions.find(
			(s) => s.session_id === session_id
		);
		if (!session) return invalidSessionResponse();

		// 2. Validate expiry
		const expiresAt = new Date(session.expires_at);
		if (expiresAt < new Date()) return invalidSessionResponse();

		// 3. Find associated user
		const user = mockUsers.find((u) => u.user_id === session.user_id);
		if (!user) return invalidSessionResponse();

		// 4. Update last activity
		session.last_activity = new Date().toISOString();

		// 5. Calculate remaining time
		const timeRemaining = expiresAt - Date.now();

		// 6. Build success response
		return NextResponse.json({
			valid: true,
			user: {
				user_id: user.user_id,
				email: user.email,
				full_name: user.full_name,
				role: user.role,
				permission: user.permission,
				assigned_groups: user.assigned_groups,
			},
			session: {
				session_id: session.session_id,
				expires_at: session.expires_at,
				time_remaining: formatTimeRemaining(timeRemaining),
				last_activity: session.last_activity,
			},
			dashboard_route: user.role === 'admin' ? 'admin' : 'groups',
			frontend_permissions: {
				can_access_admin_dashboard:
					user.role === 'admin' || user.role === 'super_admin',
				can_access_all_groups: user.role === 'super_admin',
				can_manage_group_content:
					user.role === 'admin' || user.role === 'super_admin',
			},
		});
	} catch (err) {
		console.error('Validate session error:', err);
		return invalidSessionResponse();
	}
}
