// Components/Roles.ts

export type RoleInfo = {
  title: string;
  description: string;
  color: string;
};


export const ROLES = {
  MAFIA: {
    title: "Mafia",
    description: "You don’t know the theme—but you must convincingly act like you do while editing.",
    color: "#e74c3c",
  },
  SEEKER: {
    title: "Seeker",
    description: "Complete the task and uncover who among you is the Mafia.",
    color: "#ffffff",
  },
} as const;

export type RoleKeys = keyof typeof ROLES;