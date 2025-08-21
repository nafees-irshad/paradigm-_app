/** @format */

import { NextResponse } from 'next/server';
import { mockSessions, removeSession } from '@/app/lib/mockdb';

// --- POST /api/auth/logout ---
export async function POST(req) {
	try {
		const { session_id } = await req.json();

		const sessionExists = mockSessions.find((s) => s.session_id === session_id);

		if (!sessionExists) {
			return NextResponse.json({
				success: false,
				error: 'Invalid or expired session',
				error_code: 'INVALID_SESSION',
				frontend_action: 'redirect_to_login',
			});
		}

		removeSession(session_id);

		return NextResponse.json({
			success: true,
			message: 'Logout successful',
			frontend_action: 'redirect_to_login',
		});
	} catch (err) {
		return NextResponse.json(
			{ success: false, error: 'Server error', details: err.message },
			{ status: 500 }
		);
	}
}
