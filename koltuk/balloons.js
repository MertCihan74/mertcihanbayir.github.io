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

    /**
     * Parti balonu paletleri — orta tonlar beyaza yakın değil (soluk/bej görünmez).
     * ip: vektör ip rengi
     */
    var PARTY_PALETTES = [
        {
            kind: 'cool',
            stops: { a: '#9575cd', b: '#d1c4e9', c: '#6a1b9a' },
            string: 'rgba(75, 55, 110, 0.55)',
        },
        {
            kind: 'warm',
            stops: { a: '#f06292', b: '#f8bbd9', c: '#ad1457' },
            string: 'rgba(120, 55, 85, 0.55)',
        },
        {
            kind: 'cool',
            stops: { a: '#29b6f6', b: '#b3e5fc', c: '#0277bd' },
            string: 'rgba(35, 85, 125, 0.55)',
        },
        {
            kind: 'cool',
            stops: { a: '#26c6da', b: '#b2ebf2', c: '#00838f' },
            string: 'rgba(30, 105, 115, 0.52)',
        },
        {
            kind: 'warm',
            stops: { a: '#ffb74d', b: '#ffe0b2', c: '#ef6c00' },
            string: 'rgba(130, 75, 25, 0.52)',
        },
        {
            kind: 'warm',
            stops: { a: '#ffd54f', b: '#fff9c4', c: '#f9a825' },
            string: 'rgba(115, 90, 30, 0.5)',
        },
        {
            kind: 'cool',
            stops: { a: '#7986cb', b: '#c5cae9', c: '#3949ab' },
            string: 'rgba(55, 60, 130, 0.52)',
        },
        {
            kind: 'warm',
            stops: { a: '#ec407a', b: '#f48fb1', c: '#c2185b' },
            string: 'rgba(125, 45, 85, 0.52)',
        },
        {
            kind: 'cool',
            stops: { a: '#66bb6a', b: '#c8e6c9', c: '#2e7d32' },
            string: 'rgba(40, 100, 45, 0.52)',
        },
        {
            kind: 'warm',
            stops: { a: '#ff8a65', b: '#ffccbc', c: '#d84315' },
            string: 'rgba(130, 55, 35, 0.52)',
        },
        {
            kind: 'cool',
            stops: { a: '#ba68c8', b: '#e1bee7', c: '#7b1fa2' },
            string: 'rgba(95, 45, 115, 0.52)',
        },
        {
            kind: 'warm',
            stops: { a: '#ffb3c1', b: '#ffd9e0', c: '#e91e63' },
            string: 'rgba(130, 65, 95, 0.52)',
        },
    ];

    /** Tek oval parti balonu + minik düğüm + ip (sıcak hava / sepet yok) — keskin vektör */
    function partyBalloonSvg(uid, pal) {
        var s = pal.stops;
        return (
            '<svg class="balloon-svg balloon-svg--party" viewBox="0 0 36 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs>' +
            '<linearGradient id="g' +
            uid +
            '" x1="22%" y1="8%" x2="82%" y2="92%">' +
            '<stop offset="0%" stop-color="' +
            s.a +
            '"/>' +
            '<stop offset="48%" stop-color="' +
            s.b +
            '"/>' +
            '<stop offset="100%" stop-color="' +
            s.c +
            '"/>' +
            '</linearGradient>' +
            '</defs>' +
            '<ellipse cx="18" cy="17" rx="13" ry="15.5" fill="url(#g' +
            uid +
            ')" stroke="rgba(0,0,0,0.1)" stroke-width="0.65"/>' +
            '<ellipse cx="11.5" cy="11" rx="4.5" ry="3.5" fill="#fff" opacity="0.22"/>' +
            '<path d="M18 31.5 L15 36 L18 34 L21 36 Z" fill="url(#g' +
            uid +
            ')" stroke="rgba(0,0,0,0.08)" stroke-width="0.35"/>' +
            '<line x1="18" y1="34" x2="18" y2="49" stroke="' +
            pal.string +
            '" stroke-width="1.1" stroke-linecap="round"/>' +
            '</svg>'
        );
    }

    var w = window.innerWidth;
    var count = w < 480 ? 10 : w < 900 ? 14 : 18;
    var sizeBoost = w < 480 ? 1 : w < 900 ? 1.08 : 1.15;

    var MAX_W = w < 480 ? 72 : 82;
    var MAX_H = w < 480 ? 96 : 108;

    for (var i = 0; i < count; i++) {
        var left = 3 + Math.random() * 94;
        var dur = 38 + Math.random() * 52;
        var delay = -Math.random() * dur;
        var scale = 0.48 + Math.random() * 0.36;
        var driftPx = -40 + Math.random() * 80;
        var drift = driftPx + 'px';
        var pal = PARTY_PALETTES[Math.floor(Math.random() * PARTY_PALETTES.length)];
        var rawW = Math.round((40 + Math.random() * 26) * sizeBoost);
        var rawH = Math.round((52 + Math.random() * 36) * sizeBoost);
        var envW = Math.min(MAX_W, Math.max(38, rawW));
        var envH = Math.min(MAX_H, Math.max(48, rawH));
        var opacityMid = (0.42 + Math.random() * 0.16).toFixed(3);
        var uid = 'p' + i + '_' + ((Math.random() * 1e6) | 0);

        var unit = document.createElement('div');
        unit.className = 'balloon-unit balloon-unit--party';
        unit.style.setProperty('--left', left + '%');

        var inner = document.createElement('div');
        inner.className = 'balloon-inner';
        inner.style.setProperty('--dur', dur + 's');
        inner.style.setProperty('--delay', delay + 's');
        inner.style.setProperty('--scale', String(scale));
        inner.style.setProperty('--drift', drift);
        inner.style.setProperty('--opacity-mid', opacityMid);

        var env = document.createElement('div');
        env.className =
            'balloon-envelope balloon-envelope--svg' +
            (pal.kind === 'cool' ? ' balloon-envelope--sky' : ' balloon-envelope--warm');
        env.style.setProperty('--env-w', envW + 'px');
        env.style.setProperty('--env-h', envH + 'px');
        env.innerHTML = partyBalloonSvg(uid, pal);

        inner.appendChild(env);
        unit.appendChild(inner);
        sky.appendChild(unit);
    }
})();
