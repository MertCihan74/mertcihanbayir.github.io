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

    /** Minimal tatlı pastel paletler — gövde gradient + uyumlu sepet/ip */
    var SWEET_PALETTES = [
        {
            kind: 'cool',
            stops: { a: '#c4b5d4', b: '#f3eef9', c: '#9b8ab5' },
            basket: '#a898b8',
            basketStroke: 'rgba(70, 55, 95, 0.35)',
            rope: 'rgba(85, 70, 105, 0.42)',
        },
        {
            kind: 'warm',
            stops: { a: '#f5b8c4', b: '#fff5f7', c: '#d9889a' },
            basket: '#c49aa8',
            basketStroke: 'rgba(130, 70, 90, 0.32)',
            rope: 'rgba(120, 75, 95, 0.4)',
        },
        {
            kind: 'cool',
            stops: { a: '#a8d5e8', b: '#f0f9ff', c: '#6eb5d4' },
            basket: '#8bb8cc',
            basketStroke: 'rgba(45, 85, 110, 0.32)',
            rope: 'rgba(55, 95, 120, 0.4)',
        },
        {
            kind: 'cool',
            stops: { a: '#b8e0d4', b: '#f4fffb', c: '#7dbea8' },
            basket: '#8fc4ae',
            basketStroke: 'rgba(40, 95, 75, 0.3)',
            rope: 'rgba(50, 105, 85, 0.38)',
        },
        {
            kind: 'warm',
            stops: { a: '#ffd4a8', b: '#fffaf5', c: '#f0a878' },
            basket: '#e8b896',
            basketStroke: 'rgba(140, 90, 55, 0.3)',
            rope: 'rgba(130, 85, 55, 0.4)',
        },
        {
            kind: 'warm',
            stops: { a: '#ffeaa9', b: '#fffef8', c: '#f0c85c' },
            basket: '#e8d090',
            basketStroke: 'rgba(130, 110, 45, 0.28)',
            rope: 'rgba(120, 100, 50, 0.38)',
        },
        {
            kind: 'cool',
            stops: { a: '#c5cae9', b: '#fafbff', c: '#8e99d8' },
            basket: '#a8aed4',
            basketStroke: 'rgba(55, 65, 130, 0.28)',
            rope: 'rgba(65, 75, 125, 0.38)',
        },
        {
            kind: 'warm',
            stops: { a: '#f8c8dc', b: '#fff8fb', c: '#e598b8' },
            basket: '#daa8c4',
            basketStroke: 'rgba(130, 75, 105, 0.3)',
            rope: 'rgba(125, 80, 100, 0.38)',
        },
        {
            kind: 'cool',
            stops: { a: '#abe9cd', b: '#f7fffc', c: '#6dd4a3' },
            basket: '#8fd4b0',
            basketStroke: 'rgba(35, 110, 75, 0.28)',
            rope: 'rgba(45, 115, 80, 0.38)',
        },
        {
            kind: 'warm',
            stops: { a: '#fbc4a8', b: '#fff9f5', c: '#e8956f' },
            basket: '#dcb098',
            basketStroke: 'rgba(140, 75, 50, 0.3)',
            rope: 'rgba(130, 80, 55, 0.4)',
        },
        {
            kind: 'cool',
            stops: { a: '#d7bde2', b: '#faf5fc', c: '#af7ebd' },
            basket: '#c4a8d4',
            basketStroke: 'rgba(90, 55, 115, 0.32)',
            rope: 'rgba(95, 65, 120, 0.4)',
        },
        {
            kind: 'warm',
            stops: { a: '#fad7e4', b: '#fffafd', c: '#eea9bc' },
            basket: '#e8bdd0',
            basketStroke: 'rgba(150, 85, 110, 0.28)',
            rope: 'rgba(140, 85, 105, 0.38)',
        },
    ];

    /** Küçük, düz ve yumuşak balon — ince şeritler, üç ip, minik sepet */
    function minimalBalloonSvg(uid, pal) {
        var s = pal.stops;
        return (
            '<svg class="balloon-svg balloon-svg--minimal" viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs>' +
            '<linearGradient id="g' +
            uid +
            '" x1="18%" y1="5%" x2="88%" y2="95%">' +
            '<stop offset="0%" stop-color="' +
            s.a +
            '"/>' +
            '<stop offset="52%" stop-color="' +
            s.b +
            '"/>' +
            '<stop offset="100%" stop-color="' +
            s.c +
            '"/>' +
            '</linearGradient>' +
            '<radialGradient id="hl' +
            uid +
            '" cx="30%" cy="22%" r="58%">' +
            '<stop offset="0%" stop-color="#fff" stop-opacity="0.42"/>' +
            '<stop offset="65%" stop-color="#fff" stop-opacity="0.06"/>' +
            '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
            '</radialGradient>' +
            '</defs>' +
            '<path d="M20 2.8 C9 2.8 2.2 13 2.2 23 C2.2 33 9.2 41 20 43 C30.8 41 37.8 33 37.8 23 C37.8 13 31 2.8 20 2.8 Z" fill="url(#g' +
            uid +
            ')"/>' +
            '<path d="M20 2.8 C9 2.8 2.2 13 2.2 23 C2.2 33 9.2 41 20 43 C30.8 41 37.8 33 37.8 23 C37.8 13 31 2.8 20 2.8 Z" fill="url(#hl' +
            uid +
            ')"/>' +
            '<path d="M20 2.8 C9 2.8 2.2 13 2.2 23 C2.2 33 9.2 41 20 43 C30.8 41 37.8 33 37.8 23 C37.8 13 31 2.8 20 2.8 Z" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="0.55"/>' +
            '<g stroke="rgba(255,255,255,0.35)" stroke-width="0.65" stroke-linecap="round">' +
            '<line x1="11" y1="9" x2="11" y2="36"/>' +
            '<line x1="15.5" y1="7" x2="15.5" y2="38"/>' +
            '<line x1="20" y1="6.5" x2="20" y2="39"/>' +
            '<line x1="24.5" y1="7" x2="24.5" y2="38"/>' +
            '<line x1="29" y1="9" x2="29" y2="36"/>' +
            '</g>' +
            '<line x1="14" y1="41" x2="16" y2="46.4" stroke="' +
            pal.rope +
            '" stroke-width="0.7" stroke-linecap="round"/>' +
            '<line x1="20" y1="42.5" x2="20" y2="46.6" stroke="' +
            pal.rope +
            '" stroke-width="0.7" stroke-linecap="round"/>' +
            '<line x1="26" y1="41" x2="24" y2="46.4" stroke="' +
            pal.rope +
            '" stroke-width="0.7" stroke-linecap="round"/>' +
            '<rect x="14.2" y="46.4" width="11.6" height="4.2" rx="1.3" fill="' +
            pal.basket +
            '" stroke="' +
            pal.basketStroke +
            '" stroke-width="0.4"/>' +
            '</svg>'
        );
    }

    var w = window.innerWidth;
    var count = w < 480 ? 10 : w < 900 ? 14 : 18;
    var sizeBoost = w < 480 ? 1 : w < 900 ? 1.08 : 1.15;

    var MAX_W = w < 480 ? 72 : 82;
    var MAX_H = w < 480 ? 90 : 100;

    for (var i = 0; i < count; i++) {
        var left = 3 + Math.random() * 94;
        var dur = 38 + Math.random() * 52;
        var delay = -Math.random() * dur;
        var scale = 0.48 + Math.random() * 0.36;
        var driftPx = -40 + Math.random() * 80;
        var drift = driftPx + 'px';
        var pal = SWEET_PALETTES[Math.floor(Math.random() * SWEET_PALETTES.length)];
        var rawW = Math.round((44 + Math.random() * 28) * sizeBoost);
        var rawH = Math.round((54 + Math.random() * 32) * sizeBoost);
        var envW = Math.min(MAX_W, Math.max(42, rawW));
        var envH = Math.min(MAX_H, Math.max(52, rawH));
        var opacityMid = (0.42 + Math.random() * 0.18).toFixed(3);
        var uid = 'm' + i + '_' + ((Math.random() * 1e6) | 0);

        var unit = document.createElement('div');
        unit.className = 'balloon-unit balloon-unit--minimal';
        unit.style.setProperty('--left', left + '%');
        unit.style.setProperty('--hue', '0deg');

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
        env.innerHTML = minimalBalloonSvg(uid, pal);

        inner.appendChild(env);
        unit.appendChild(inner);
        sky.appendChild(unit);
    }
})();
