export interface PublicUser {
	id: number;
	slug: string;
	full_name: string;
	email: string;
}

export interface Report {
	id: number;
	member_id: number;
	month: string;
	actions_done: string;
	actions_planned: string;
	cooperation: string;
	projects: string;
	created_at: string;
	updated_at: string;
}

export interface MemberReport extends Report {
	full_name: string;
	slug: string;
}

export interface MemberRow {
	id: number;
	slug: string;
	full_name: string;
	email: string;
	password_hash: string;
	is_active: number;
	is_deleted: number;
	created_at: string;
}
