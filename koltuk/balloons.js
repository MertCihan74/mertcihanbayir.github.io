(function initBalloons() {
    function setBalloonRiseDistance() {
        var h = window.innerHeight;
        document.documentElement.style.setProperty(
            '--balloon-rise-px',
            Math.round(h * 1.34) + 'px'
        );
    }

    setBalloonRiseDistance();
    window.addEventListener('orientationchange', function () {
        setTimeout(setBalloonRiseDistance, 350);
    });

    const sky = document.getElementById('balloon-sky');
    if (!sky) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sky.remove();
        return;
    }

    /** koltuk/ içindeki CC0 SVG dosyaları (yeniden adlandırılmış) */
    var BALLOON_SVGS = [
        'balloon-1.svg',
        'balloon-2.svg',
        'balloon-3.svg',
        'balloon-4.svg',
        'balloon-5.svg',
        'balloon-6.svg',
        'balloon-7.svg',
    ];

    var w = window.innerWidth;
    var count = w < 480 ? 10 : w < 900 ? 14 : 18;
    var sizeBoost = w < 480 ? 1 : w < 900 ? 1.1 : 1.18;

    var MAX_W = w < 480 ? 78 : 92;
    var MAX_H = w < 480 ? 102 : 118;

    for (var i = 0; i < count; i++) {
        var left = 3 + Math.random() * 94;
        var dur = 38 + Math.random() * 52;
        var delay = -Math.random() * dur;
        var scale = 0.52 + Math.random() * 0.34;
        var driftPx = -45 + Math.random() * 90;
        var drift = driftPx + 'px';
        var rawW = Math.round((50 + Math.random() * 28) * sizeBoost);
        var rawH = Math.round((62 + Math.random() * 34) * sizeBoost);
        var envW = Math.min(MAX_W, Math.max(46, rawW));
        var envH = Math.min(MAX_H, Math.max(58, rawH));
        var opacityMid = (0.4 + Math.random() * 0.15).toFixed(3);
        var src =
            BALLOON_SVGS[Math.floor(Math.random() * BALLOON_SVGS.length)];

        var unit = document.createElement('div');
        unit.className = 'balloon-unit balloon-unit--asset';
        unit.style.setProperty('--left', left + '%');

        var inner = document.createElement('div');
        inner.className = 'balloon-inner';
        inner.style.setProperty('--dur', dur + 's');
        inner.style.setProperty('--delay', delay + 's');
        inner.style.setProperty('--scale', String(scale));
        inner.style.setProperty('--drift', drift);
        inner.style.setProperty('--opacity-mid', opacityMid);

        var env = document.createElement('div');
        env.className = 'balloon-envelope balloon-envelope--svg balloon-envelope--asset';
        env.style.setProperty('--env-w', envW + 'px');
        env.style.setProperty('--env-h', envH + 'px');

        var img = document.createElement('img');
        img.className = 'balloon-img';
        img.src = src;
        img.alt = '';
        img.setAttribute('aria-hidden', 'true');
        img.loading = 'lazy';
        img.decoding = 'async';
        img.draggable = false;

        env.appendChild(img);
        inner.appendChild(env);
        unit.appendChild(inner);
        sky.appendChild(unit);
    }
})();
