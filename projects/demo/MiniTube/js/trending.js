const trendingGrid = document.getElementById("trendingGrid");

async function loadTrendingVideos() {
  try {
    trendingGrid.innerHTML = `<div class="loading">
                Loading trending videos...
            </div>`;

    const videos = await getPopularVideos("IN", 32);

    trendingGrid.innerHTML = "";

    videos.forEach((video) => {
      const card = createVideoCard(video);

      trendingGrid.appendChild(card);
    });
  } catch (error) {
    console.error(error);

    trendingGrid.innerHTML = `

            <div class="error">

                <h2>
                    Unable to load trending videos
                </h2>

                <p>
                    Please check your API configuration.
                </p>

            </div>

        `;
  }
}

loadTrendingVideos();
