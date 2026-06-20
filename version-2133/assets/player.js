(function () {
  function setupPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var message = shell.querySelector('[data-player-message]');
    var source = shell.getAttribute('data-video-src');
    var hlsInstance = null;

    function showMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function hideOverlay() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function playVideo() {
      if (!source) {
        showMessage('当前影片未配置播放源。');
        return;
      }

      hideOverlay();
      showMessage('正在加载播放源...');

      if (window.Hls && window.Hls.isSupported()) {
        if (hlsInstance) {
          hlsInstance.destroy();
        }

        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          showMessage('播放源加载完成。');
          video.play().catch(function () {
            showMessage('浏览器阻止了自动播放，请点击播放器播放。');
          });
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage('播放源加载失败，请检查网络或播放地址。');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          showMessage('播放源加载完成。');
          video.play().catch(function () {
            showMessage('浏览器阻止了自动播放，请点击播放器播放。');
          });
        }, { once: true });
      } else {
        video.src = source;
        video.play().catch(function () {
          showMessage('当前浏览器需要 HLS 支持，请启用网络后重试。');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('play', hideOverlay);
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(setupPlayer);
  });
})();
