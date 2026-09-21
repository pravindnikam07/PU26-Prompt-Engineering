const videoPlayer = document.getElementById("videoPlayer");

const videoTitle = document.getElementById("videoTitle");

const channelName = document.getElementById("channelName");

const videoStats = document.getElementById("videoStats");

const videoDescription = document.getElementById("videoDescription");

const urlParams = new URLSearchParams(window.location.search);

const videoId = urlParams.get("v");

async function loadVideo() {
  if (!videoId) {
    videoTitle.textContent = "Video not found";

    return;
  }

  // YouTube Embedded Player

  videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;

  try {
    const video = await getVideoDetails(videoId);

    if (!video) {
      videoTitle.textContent = "Video not found";

      return;
    }

    const snippet = video.snippet;

    const statistics = video.statistics || {};

    videoTitle.textContent = snippet.title;

    channelName.textContent = snippet.channelTitle;

    videoStats.textContent = `${formatViews(statistics.viewCount || 0)}
             •
             ${formatDate(snippet.publishedAt)}`;

    videoDescription.textContent =
      snippet.description || "No description available.";

    document.title = `${snippet.title} - MiniTube`;
  } catch (error) {
    console.error(error);

    videoTitle.textContent = "Unable to load video information";
  }
}

loadVideo();
