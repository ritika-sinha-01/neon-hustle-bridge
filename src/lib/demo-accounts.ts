/** Public demo credentials — seeded via backend db:seed, safe to show in UI */
export const DEMO_STUDENT = {
  email: "demo.student@hustlebridge.dev",
  password: "Password1",
  role: "student" as const,
};

export const DEMO_CLIENT = {
  email: "demo.client@hustlebridge.dev",
  password: "Password1",
  role: "client" as const,
};
