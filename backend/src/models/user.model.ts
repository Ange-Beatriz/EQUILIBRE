export type UserRow = {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "APPRENTI" | "TUTEUR" | "ENCADRANT" | "ADMIN";
  created_at: Date;
};
