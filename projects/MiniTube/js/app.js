// ========================================
// APPLICATION STATE
// ========================================

let nextPageToken = "";

let currentQuery = "programming";

// ========================================
// DOM ELEMENTS
// ========================================

const searchInput = document.getElementById("searchInput");

const searchButton = document.getElementById("searchButton");

const videoGrid = document.getElementById("videoGrid");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("errorMessage");

const loadMoreButton = document.getElementById("loadMoreButton");

const pageTitle = document.getElementById("pageTitle");

const themeButton = document.getElementById("themeButton");

const menuButton = document.getElementById("menuButton");

const sidebar = document.getElementById("sidebar");

// ========================================
// INITIALIZE
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  loadVideos(currentQuery);
});

// ========================================
// SEARCH
// ========================================

searchButton.addEventListener("click", performSearch);

searchInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});

function performSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    return;
  }

  currentQuery = query;

  nextPageToken = "";

  videoGrid.innerHTML = "";

  pageTitle.textContent = `Search results for "${query}"`;

  loadVideos(query);
}

// ========================================
// LOAD VIDEOS
// ========================================

async function loadVideos(query) {
  showLoading();

  hideError();

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");

    url.searchParams.set("part", "snippet");

    url.searchParams.set("q", query);

    url.searchParams.set("type", "video");

    url.searchParams.set("maxResults", CONFIG.MAX_RESULTS);

    url.searchParams.set("regionCode", CONFIG.REGION_CODE);

    url.searchParams.set("videoEmbeddable", "true");

    url.searchParams.set("key", CONFIG.YOUTUBE_API_KEY);

    if (nextPageToken) {
      url.searchParams.set("pageToken", nextPageToken);
    }

    const response = await fetch(url);

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    nextPageToken = data.nextPageToken || "";

    const videoIds = data.items.map((item) => item.id.videoId).filter(Boolean);

    if (videoIds.length === 0) {
      throw new Error("No videos found.");
    }

    const detailedVideos = await getVideoDetails(videoIds);

    displayVideos(detailedVideos);
  } catch (error) {
    console.error(error);

    showError(error.message || "Unable to load videos.");
  } finally {
    hideLoading();
  }
}

// ========================================
// GET VIDEO DETAILS
// ========================================

async function getVideoDetails(videoIds) {
  const url = new URL("https://www.googleapis.com/youtube/v3/videos");

  url.searchParams.set("part", "snippet,statistics,contentDetails");

  url.searchParams.set("id", videoIds.join(","));

  url.searchParams.set("key", CONFIG.YOUTUBE_API_KEY);

  const response = await fetch(url);

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.items || [];
}

// ========================================
// DISPLAY VIDEOS
// ========================================

function displayVideos(videos) {
  videos.forEach((video) => {
    const videoId = video.id;

    const snippet = video.snippet;

    const statistics = video.statistics;

    const duration = video.contentDetails.duration;

    const card = document.createElement("article");

    card.className = "video-card";

    card.innerHTML = `

            <div class="thumbnail-container">

                <img
                    class="thumbnail"
                    src="${snippet.thumbnails.high.url}"
                    alt="${escapeHTML(snippet.title)}"
                    loading="lazy"
                >


                <span class="duration">

                    ${formatDuration(duration)}

                </span>

            </div>


            <div class="video-info">


                <div class="channel-avatar">

                    ${getInitials(snippet.channelTitle)}

                </div>


                <div class="video-details">


                    <h3 class="video-title">

                        ${escapeHTML(snippet.title)}

                    </h3>


                    <p class="channel-name">

                        ${escapeHTML(snippet.channelTitle)}

                    </p>


                    <p class="video-meta">

                        ${formatViews(statistics.viewCount)}
                        views
                        •
                        ${formatDate(snippet.publishedAt)}

                    </p>

                </div>

            </div>

        `;

    card.addEventListener("click", () => {
      openVideo(videoId);
    });

    videoGrid.appendChild(card);
  });
}

// ========================================
// OPEN VIDEO
// ========================================

function openVideo(videoId) {
  window.location.href = `watch.html?v=${videoId}`;
}

// ========================================
// LOAD MORE
// ========================================

loadMoreButton.addEventListener("click", () => {
  if (!nextPageToken) {
    alert("No more videos available.");

    return;
  }

  loadVideos(currentQuery);
});

// ========================================
// CATEGORY BUTTONS
// ========================================

const categoryButtons = document.querySelectorAll(".category");

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    const query = button.dataset.query;

    currentQuery = query;

    nextPageToken = "";

    videoGrid.innerHTML = "";

    pageTitle.textContent = button.textContent.trim();

    loadVideos(query);
  });
});

// ========================================
// SIDEBAR CATEGORIES
// ========================================

const navItems = document.querySelectorAll(".nav-item[data-category]");

navItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();

    const category = item.dataset.category;

    let query = category;

    if (category === "trending") {
      query = "trending videos";
    }

    if (category === "education") {
      query = "educational videos";
    }

    currentQuery = query;

    nextPageToken = "";

    videoGrid.innerHTML = "";

    pageTitle.textContent = item.innerText.trim();

    loadVideos(query);
  });
});

// ========================================
// DARK MODE
// ========================================

themeButton.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");

  themeButton.textContent = isDark ? "☀️" : "🌙";

  localStorage.setItem("theme", isDark ? "dark" : "light");
});

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");

  themeButton.textContent = "☀️";
}

// ========================================
// MOBILE MENU
// ========================================

menuButton.addEventListener("click", () => {
  if (window.innerWidth <= 900) {
    if (sidebar.style.display === "none") {
      sidebar.style.display = "block";
    } else {
      sidebar.style.display = "none";
    }
  }
});

// ========================================
// FORMAT VIEWS
// ========================================

function formatViews(viewCount) {
  const views = Number(viewCount);

  if (views >= 1000000000) {
    return (views / 1000000000).toFixed(1) + "B";
  }

  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  }

  if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }

  return views.toString();
}

// ========================================
// FORMAT VIDEO DURATION
// ========================================

function formatDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return "0:00";
  }

  const hours = parseInt(match[1] || 0);

  const minutes = parseInt(match[2] || 0);

  const seconds = parseInt(match[3] || 0);

  if (hours > 0) {
    return (
      `${hours}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(seconds).padStart(2, "0")}`
    );
  }

  return `${minutes}:` + `${String(seconds).padStart(2, "0")}`;
}

// ========================================
// DATE
// ========================================

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ========================================
// INITIALS
// ========================================

function getInitials(name) {
  if (!name) {
    return "YT";
  }

  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

// ========================================
// LOADING
// ========================================

function showLoading() {
  loading.style.display = "block";
}

function hideLoading() {
  loading.style.display = "none";
}

// ========================================
// ERROR
// ========================================

function showError(message) {
  errorMessage.textContent = message;

  errorMessage.style.display = "block";
}

function hideError() {
  errorMessage.style.display = "none";
}
