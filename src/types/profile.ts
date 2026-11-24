export const PROFILE_AVATARS = [
  { id: 'ball', name: 'Balón', emoji: '⚽' },
  { id: 'lion', name: 'León', emoji: '🦁' },
  { id: 'eagle', name: 'Águila', emoji: '🦅' },
  { id: 'glove', name: 'Arquero', emoji: '🧤' },
  { id: 'star', name: 'Estrella', emoji: '⭐' },
  { id: 'fire', name: 'Pasión', emoji: '🔥' },
] as const;

export type ProfileAvatarId = (typeof PROFILE_AVATARS)[number]['id'];

export interface UserProfileSettings {
  displayName: string;
  avatarId: ProfileAvatarId;
  favoriteClubId: string;
}

export const DEFAULT_PROFILE_SETTINGS: UserProfileSettings = {
  displayName: '',
  avatarId: 'ball',
  favoriteClubId: '',
};
