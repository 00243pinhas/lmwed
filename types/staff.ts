export type StaffRole = 'owner' | 'staff';

export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  active: boolean;
  must_change_password: boolean;
  created_at: string;
};
