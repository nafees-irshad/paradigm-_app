/** @format */
import { NextResponse } from 'next/server';
import { refreshSession } from '@/app/lib/mockdb';
import { mockUsers } from '@/app/lib/mockdb';

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

export async function POST(req) {
	try {
		const { session_id } = await req.json();

		if (!session_id) {
			return invalidSessionResponse();
		}

		// ✅ Use global
		const session = global.mockSessions.find(
			(s) => s.session_id === session_id
		);

		if (!session) {
			return invalidSessionResponse();
		}

		// Check expiry
		if (new Date(session.expires_at) < new Date()) {
			return invalidSessionResponse();
		}

		// Refresh session
		const refreshed = refreshSession(session);

		const user = mockUsers.find((u) => u.user_id === session.user_id);
		if (!user) {
			return invalidSessionResponse();
		}

		return NextResponse.json({
			success: true,
			message: 'Token refreshed successfully',
			session: refreshed,
			user: {
				user_id: user.user_id,
				email: user.email,
				full_name: user.full_name,
				role: user.role,
				permission: user.permission,
			},
		});
	} catch (err) {
		console.error('Refresh token error:', err);
		return invalidSessionResponse();
	}
}
