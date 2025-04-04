export function getSocialMediaType(url: string): string {
  const urlObj = new URL(url);
  const hostname = urlObj.hostname.toLowerCase();
  
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return 'youtube';
  } else if (hostname.includes('tiktok.com')) {
    return 'tiktok';
  } else if (hostname.includes('instagram.com')) {
    return 'instagram';
  } else if (hostname.includes('facebook.com') || hostname.includes('fb.com')) {
    return 'facebook';
  } else if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return 'twitter';
  } else {
    return 'unknown';
  }
}
