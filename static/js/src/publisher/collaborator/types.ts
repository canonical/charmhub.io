export type Collaborator = {
  email: string;
  display_name: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string;
  account_id: string;
};

export type Invite = {
  accepted_at: string | null;
  accepted_by: string | null;
  created_at: string;
  created_by: string;
  email: string;
  expires_at: string | null;
  invite_type: string;
  revoked_at: string | null;
  revoked_by: string | null;
};
