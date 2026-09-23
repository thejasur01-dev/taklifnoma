/** Share URLs for messengers. Instagram has no web share link: the UI copies the URL instead. */
export function shareLinks(url: string, message: string) {
  const text = `${message} ${url}`;
  return {
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
  };
}

export function invitationUrl(siteUrl: string, slug: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/i/${slug}`;
}
