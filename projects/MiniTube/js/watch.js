// ========================================
// GET VIDEO ID FROM URL
// ========================================

const urlParams = new URLSearchParams(window.location.search);

const videoId = urlParams.get("v");

// ========================================
// DOM ELEMENTS
// ========================================

const videoPlayer = document.getElementById("videoPlayer");

const videoTitle = document.getElementById("videoTitle");

const channelName = document.getElementById("channelName");

const channelAvatar = document.getElementById("channelAvatar");

const videoDescription = document.getElementById("videoDescription");

const videoDate = document.getElementById("videoDate");

const relatedVideos = document.getElementById("relatedVideos");

const likeButton = document.getElementById("likeButton");

const saveButton = document.getElementById("saveButton");

const shareButton = document.getElementById("shareButton");

// ========================================
// CHECK VIDEO ID
// ========================================

if (!videoId) {
  videoTitle.textContent = "Video not found.";
} else {
  initializeVideo();
}

// ========================================
// INITIALIZE VIDEO
// ========================================

async function initializeVideo() {
  setPlayer();

  await getVideoDetails();

  await getRelatedVideos();

  saveToHistory();
}

// ========================================
// SET YOUTUBE PLAYER
// ========================================

function setPlayer() {
  videoPlayer.src = `https://www.youtube.com/embed/${videoId}`;
}

// ========================================
// GET VIDEO DETAILS
// ========================================

async function getVideoDetails() {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");

    url.searchParams.set("part", "snippet,statistics");

    url.searchParams.set("id", videoId);

    url.searchParams.set("key", CONFIG.YOUTUBE_API_KEY);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Unable to fetch video.");
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found.");
    }

    const video = data.items[0];

    displayVideoDetails(video);
  } catch (error) {
    console.error(error);

    videoTitle.textContent = "Unable to load video information.";
  }
}

// ========================================
// DISPLAY VIDEO DETAILS
// ========================================

function displayVideoDetails(video) {
  const snippet = video.snippet;

  videoTitle.textContent = snippet.title;

  channelName.textContent = snippet.channelTitle;

  channelAvatar.textContent = getInitials(snippet.channelTitle);

  videoDescription.textContent =
    snippet.description || "No description available.";

  videoDate.textContent = `Published ${formatDate(snippet.publishedAt)}`;
}

// ========================================
// GET RELATED VIDEOS
// ========================================

async function getRelatedVideos() {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");

    url.searchParams.set("part", "snippet");

    url.searchParams.set("relatedToVideoId", videoId);

    url.searchParams.set("type", "video");

    url.searchParams.set("maxResults", 10);

    url.searchParams.set("key", CONFIG.YOUTUBE_API_KEY);

    const response = await fetch(url);

    const data = await response.json();

    displayRelatedVideos(data.items);
  } catch (error) {
    console.error(error);
  }
}

// ========================================
// DISPLAY RELATED VIDEOS
// ========================================

function displayRelatedVideos(videos) {
  relatedVideos.innerHTML = "";

  if (!videos || videos.length === 0) {
    relatedVideos.innerHTML = "<p>No related videos found.</p>";

    return;
  }

  videos.forEach((video) => {
    const id = video.id.videoId;

    const snippet = video.snippet;

    const card = document.createElement("div");

    card.className = "related-card";

    card.innerHTML = `

            <img
                class="related-thumbnail"
                src="${snippet.thumbnails.medium.url}"
                alt="${escapeHTML(snippet.title)}"
            >


            <div class="related-details">

                <div class="related-title">

                    ${escapeHTML(snippet.title)}

                </div>


                <div class="related-channel">

                    ${escapeHTML(snippet.channelTitle)}

                </div>

            </div>

        `;

    card.addEventListener("click", () => {
      window.location.href = `watch.html?v=${id}`;
    });

    relatedVideos.appendChild(card);
  });
}

// ========================================
// LIKE BUTTON
// ========================================

likeButton.addEventListener("click", () => {
  likeButton.classList.toggle("active");
});

// ========================================
// SAVE BUTTON
// ========================================

saveButton.addEventListener("click", () => {
  let savedVideos = JSON.parse(localStorage.getItem("watchLater")) || [];

  if (savedVideos.includes(videoId)) {
    savedVideos = savedVideos.filter((id) => id !== videoId);

    saveButton.classList.remove("active");

    saveButton.innerHTML = "⏰ <span>Save</span>";
  } else {
    savedVideos.push(videoId);

    saveButton.classList.add("active");

    saveButton.innerHTML = "✓ <span>Saved</span>";
  }

  localStorage.setItem("watchLater", JSON.stringify(savedVideos));
});

// ========================================
// SHARE BUTTON
// ========================================

shareButton.addEventListener("click", async () => {
  const shareURL = window.location.href;

  try {
    await navigator.clipboard.writeText(shareURL);

    shareButton.innerHTML = "✓ <span>Copied</span>";

    setTimeout(() => {
      shareButton.innerHTML = "↗ <span>Share</span>";
    }, 2000);
  } catch (error) {
    alert("Copy this URL:\n" + shareURL);
  }
});

// ========================================
// DESCRIPTION EXPAND
// ========================================

const descriptionButton = document.getElementById("descriptionButton");

descriptionButton.addEventListener("click", () => {
  videoDescription.classList.toggle("expanded");

  if (videoDescription.classList.contains("expanded")) {
    descriptionButton.textContent = "Show less";
  } else {
    descriptionButton.textContent = "Show more";
  }
});

// ========================================
// WATCH HISTORY
// ========================================

function saveToHistory() {
  let history = JSON.parse(localStorage.getItem("watchHistory")) || [];

  history = history.filter((id) => id !== videoId);

  history.unshift(videoId);

  history = history.slice(0, 50);

  localStorage.setItem("watchHistory", JSON.stringify(history));
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
// DATE FORMAT
// ========================================

function formatDate(dateString) {
  const date = new Date(dateString);

  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(text) {
  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}
