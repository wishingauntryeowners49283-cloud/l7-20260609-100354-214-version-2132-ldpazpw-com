function initializeMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    if (!video || !config || !config.source) {
        return;
    }

    video.poster = config.poster || video.poster;

    if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(config.source);
        hls.attachMedia(video);
    } else {
        video.src = config.source;
    }

    function hideOverlay() {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    }

    function showOverlay() {
        if (overlay && video.paused) {
            overlay.classList.remove("is-hidden");
        }
    }

    function startPlayback() {
        hideOverlay();
        var playResult = video.play();
        if (playResult && typeof playResult.catch === "function") {
            playResult.catch(function () {
                showOverlay();
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", showOverlay);
    video.addEventListener("ended", showOverlay);
}
