document.addEventListener("DOMContentLoaded", function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var button = player.querySelector("button");
    var message = player.querySelector("[data-player-message]");
    var stream = video ? video.getAttribute("data-stream") : "";
    var hls = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text;
      }
    }

    function prepare() {
      if (!video || !stream || video.getAttribute("data-ready") === "1") {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        video.setAttribute("data-ready", "1");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          autoStartLoad: true,
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(stream);
        hls.attachMedia(video);
        video.setAttribute("data-ready", "1");
        return;
      }

      showMessage("当前播放线路暂时不可用，请稍后再试");
    }

    function play() {
      prepare();

      if (!video) {
        return;
      }

      var result = video.play();

      if (result && typeof result.catch === "function") {
        result.catch(function () {
          showMessage("点击播放按钮开始观看");
        });
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
        showMessage("");
      });

      video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
      });

      video.addEventListener("error", function () {
        showMessage("播放线路暂时不可用，请稍后再试");
      });
    }
  });
});
