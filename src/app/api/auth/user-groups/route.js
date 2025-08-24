/** @format */

// src/app/api/auth/user-groups/route.js
import { NextResponse } from 'next/server';
import { mockSessions, mockUsers, mockGroups } from '@/app/lib/mockdb';
import jwt from 'jsonwebtoken';

const SECRET = 'supersecret';

// --- Error Response Helper ---
function invalidSessionResponse() {
	return NextResponse.json(
		{
			success: false,
			error: 'Invalid or expired session',
			error_code: 'INVALID_SESSION',
			frontend_action: 'redirect_to_login',
		},
		{ status: 401 }
	);
}

// --- API Route ---
export async function GET(req) {
	try {
		const { searchParams } = new URL(req.url);
		const session_id = searchParams.get('session_id');
		console.log(session_id);

		if (!session_id) return invalidSessionResponse();

		// 1. Find session
		const session = mockSessions.find((s) => s.session_id === session_id);
		if (!session) return invalidSessionResponse();

		// 2. Verify JWT
		try {
			jwt.verify(session.token, SECRET);
		} catch (err) {
			console.error('JWT verification failed:', err.message);
			return invalidSessionResponse();
		}

		// 3. Find user
		const user = mockUsers.find((u) => u.user_id === session.user_id);
		if (!user) return invalidSessionResponse();

		// 4. Map assigned groups with details
		const assigned_groups = user.assigned_groups
			.map((gid) => {
				const group = mockGroups.find((g) => g.group_id === gid);
				if (!group) return null;

				// Use the role → access_level mapping
				return {
					group_id: group.group_id,
					group_name: group.group_name,
					access_level: group.access_level_map[user.role] || 'member',
					member_count: group.member_count,
					project_count: group.project_count,
				};
			})
			.filter(Boolean);

		// 5. Return response
		return NextResponse.json({
			success: true,
			user_id: user.user_id,
			assigned_groups,
		});
	} catch (err) {
		console.error('User-groups error:', err);
		return invalidSessionResponse();
	}
}
