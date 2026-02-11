export const KUDOS_CATEGORIES = ['Great Job', 'Thank You', 'Teamwork'] as const;

export type KudosCategory = (typeof KUDOS_CATEGORIES)[number];

export type Kudos = {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  category: KudosCategory;
  createdAt: string;
};
