export type SpotifyItemType = 'artist' | 'album' | 'song';

export function coverForSpotifyItem(type: SpotifyItemType, data: any): string | null {
  if (!data) return null;
  if (type === 'song') return data.album?.images?.[0]?.url || null;
  return data.images?.[0]?.url || null;
}

export function nameForSpotifyItem(data: any): string {
  return data?.name || '';
}

export function subtitleForSpotifyItem(type: SpotifyItemType, data: any): string {
  if (!data) return '';
  if (type === 'song' || type === 'album') return data.artists?.[0]?.name || '';
  return '';
}
