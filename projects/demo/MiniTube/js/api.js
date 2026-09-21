async function getPopularVideos(regionCode = "IN", maxResults = 32) {
  const url =
    `${API_BASE_URL}/videos` +
    `?part=snippet,statistics,contentDetails` +
    `&chart=mostPopular` +
    `&regionCode=${regionCode}` +
    `&maxResults=${maxResults}` +
    `&key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch popular videos");
    }

    const data = await response.json();

    return data.items || [];
  } catch (error) {
    console.error(error);

    throw error;
  }
}

async function searchVideos(query, maxResults = 32) {
  const url =
    `${API_BASE_URL}/search` +
    `?part=snippet` +
    `&q=${encodeURIComponent(query)}` +
    `&type=video` +
    `&maxResults=${maxResults}` +
    `&key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to search videos");
    }

    const data = await response.json();

    return data.items || [];
  } catch (error) {
    console.error(error);

    throw error;
  }
}

async function getVideoDetails(videoId) {
  const url =
    `${API_BASE_URL}/videos` +
    `?part=snippet,statistics,contentDetails` +
    `&id=${videoId}` +
    `&key=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to fetch video details");
    }

    const data = await response.json();

    return data.items?.[0] || null;
  } catch (error) {
    console.error(error);

    throw error;
  }
}

function formatViews(viewCount) {
  const views = Number(viewCount);

  if (views >= 1000000000) {
    return (views / 1000000000).toFixed(1) + "B views";
  }

  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M views";
  }

  if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K views";
  }

  return views + " views";
}

function formatDate(dateString) {
  const date = new Date(dateString);

  const now = new Date();

  const difference = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (difference === 0) {
    return "Today";
  }

  if (difference === 1) {
    return "1 day ago";
  }

  if (difference < 30) {
    return `${difference} days ago`;
  }

  if (difference < 365) {
    const months = Math.floor(difference / 30);

    return `${months} month${months > 1 ? "s" : ""} ago`;
  }

  const years = Math.floor(difference / 365);

  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function createVideoCard(video) {
  let videoId;

  if (video.id?.videoId) {
    videoId = video.id.videoId;
  } else {
    videoId = video.id;
  }

  const snippet = video.snippet;

  const statistics = video.statistics || {};

  const thumbnail =
    snippet.thumbnails?.medium?.url ||
    snippet.thumbnails?.high?.url ||
    snippet.thumbnails?.default?.url;

  const card = document.createElement("div");

  card.className = "video-card";

  card.innerHTML = `

      <div class="thumbnail-container">

          <img
              src="${thumbnail}"
              alt="${escapeHTML(snippet.title)}"
              class="video-thumbnail"
          >

      </div>

      <div class="video-info">

          <div class="channel-avatar">
              ${snippet.channelTitle.charAt(0).toUpperCase()}
          </div>

          <div class="video-text">

              <h3 class="video-title">
                  ${escapeHTML(snippet.title)}
              </h3>

              <p class="channel-name">
                  ${escapeHTML(snippet.channelTitle)}
              </p>

              <p class="video-meta">

                  ${
                    statistics.viewCount
                      ? formatViews(statistics.viewCount)
                      : ""
                  }

                  •

                  ${formatDate(snippet.publishedAt)}

              </p>

          </div>

      </div>
  `;

  card.addEventListener("click", function () {
    window.location.href = `watch.html?v=${videoId}`;
  });

  return card;
}

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}
