const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const ADULTS_PLAYLIST_ID = "PL4s3joY1T2BDuyd29WzWnQw7T5K8j7p8s";

export async function fetchAdultsSermons(maxResults = 18) {
  const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("playlistId", ADULTS_PLAYLIST_ID);
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url.toString());
  const data = await res.json();

  if (data.error) throw new Error(data.error.message);

  return (data.items ?? []).map((item: any) => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url ?? item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    videoUrl: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
  }));
}