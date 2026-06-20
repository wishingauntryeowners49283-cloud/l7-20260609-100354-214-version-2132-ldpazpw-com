(function () {
    function loadVideo(wrapper) {
        var video = wrapper.querySelector('video');
        var overlay = wrapper.querySelector('.player-overlay');
        var source = wrapper.getAttribute('data-source');

        if (!video || !source) {
            return;
        }

        if (!video.getAttribute('data-ready')) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                wrapper.hlsPlayer = hls;
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', 'true');
        }

        if (overlay) {
            overlay.classList.add('hidden');
        }

        video.setAttribute('controls', 'controls');

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.setAttribute('controls', 'controls');
            });
        }
    }

    function bindPlayer(wrapper) {
        var video = wrapper.querySelector('video');
        var overlay = wrapper.querySelector('.player-overlay');

        if (overlay) {
            overlay.addEventListener('click', function () {
                loadVideo(wrapper);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!video.getAttribute('data-ready') || video.paused) {
                    loadVideo(wrapper);
                }
            });
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('.video-player')).forEach(bindPlayer);
    });
})();
