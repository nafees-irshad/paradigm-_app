/** @format */
import { NextResponse } from 'next/server';
import { mockSessions, mockUsers, mockGroups } from '@/app/lib/mockdb';

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

export async function GET(req, { params }) {
	try {
		// ✅ Correct way: await params and then destructure
		const { group_id } = await params;
		const decodedGroupId = decodeURIComponent(group_id);

		const { searchParams } = new URL(req.url);
		const session_id = searchParams.get('session_id');

		if (!session_id || !decodedGroupId) {
			return invalidSessionResponse();
		}

		// 1. Find session
		const session = mockSessions.find((s) => s.session_id === session_id);
		if (!session) return invalidSessionResponse();

		// 2. Find user
		const user = mockUsers.find((u) => u.user_id === session.user_id);
		if (!user) return invalidSessionResponse();

		// 3. Check if user has this group (use decodedGroupId for comparison)
		const group = mockGroups.find((g) => g.group_id === decodedGroupId);
		if (!group || !user.assigned_groups.includes(decodedGroupId)) {
			return NextResponse.json(
				{
					success: false,
					error: 'Access denied to this group',
					error_code: 'GROUP_ACCESS_DENIED',
					frontend_action: 'redirect_to_groups',
				},
				{ status: 403 }
			);
		}

		// 4. Build access response
		return NextResponse.json({
			success: true,
			group: {
				group_id: group.group_id,
				group_name: group.group_name,
				access_level: group.access_level_map[user.role] || 'member',
				member_count: group.member_count,
				project_count: group.project_count,
			},
		});
	} catch (err) {
		console.error('Group access error:', err);
		return invalidSessionResponse();
	}
}
