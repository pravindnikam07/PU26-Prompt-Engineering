const videoGrid = document.getElementById("videoGrid");

const searchInput = document.getElementById("searchInput");

const searchButton = document.getElementById("searchButton");

async function loadHomeVideos() {
  try {
    videoGrid.innerHTML = `<div class="loading">Loading videos...</div>`;

    const videos = await getPopularVideos("IN", 32);

    videoGrid.innerHTML = "";

    if (videos.length === 0) {
      videoGrid.innerHTML = `<div class="error">
                    No videos found.
                </div>`;

      return;
    }

    videos.forEach((video) => {
      const card = createVideoCard(video);

      videoGrid.appendChild(card);
    });
  } catch (error) {
    videoGrid.innerHTML = `

            <div class="error">

                <h2>Unable to load videos</h2>

                <p>
                    Please check your YouTube API key
                    and internet connection.
                </p>

            </div>

        `;
  }
}

async function performSearch() {
  const query = searchInput.value.trim();

  if (!query) {
    loadHomeVideos();

    return;
  }

  try {
    videoGrid.innerHTML = `<div class="loading">
                Searching...
            </div>`;

    document.getElementById(
      "pageTitle"
    ).textContent = `Search results for "${query}"`;

    const videos = await searchVideos(query, 32);

    videoGrid.innerHTML = "";

    if (videos.length === 0) {
      videoGrid.innerHTML = `<div class="error">
                    No videos found.
                </div>`;

      return;
    }

    videos.forEach((video) => {
      const card = createVideoCard(video);

      videoGrid.appendChild(card);
    });
  } catch (error) {
    videoGrid.innerHTML = `<div class="error">
                Search failed.
            </div>`;
  }
}

searchButton.addEventListener("click", performSearch);

searchInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    performSearch();
  }
});

loadHomeVideos();
