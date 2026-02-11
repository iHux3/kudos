import type { KudosCategory } from '@kudos/shared';

export const categoryBadgeMap: Record<KudosCategory, { icon: string; label: string }> = {
  'Great Job': { icon: '⭐', label: 'Great Job' },
  'Thank You': { icon: '🙏', label: 'Thank You' },
  Teamwork: { icon: '🤝', label: 'Teamwork' },
};

export const formatDate = (dateIsoString: string) =>
  new Intl.DateTimeFormat('cs-CZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateIsoString));
