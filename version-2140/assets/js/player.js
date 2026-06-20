(function () {
  window.initMoviePlayer = function (streamUrl, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var hls = null;
    var ready = false;

    function bindSource() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            overlay.classList.remove('is-hidden');
            overlay.innerHTML = '<button class="player-button" type="button" aria-label="播放">▶</button>';
            ready = false;
            if (hls) {
              hls.destroy();
              hls = null;
            }
          }
        });
      }
    }

    function playVideo() {
      bindSource();
      overlay.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', playVideo);
    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
    });
    video.addEventListener('pause', function () {
      overlay.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
}());
