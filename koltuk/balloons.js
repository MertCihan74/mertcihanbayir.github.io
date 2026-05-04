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

    /** Kapadokya tarzı çeşitli gövde renkleri (gradient + sepet + brülör uyumu) */
    var BALLOON_PALETTES = [
        {
            kind: 'warm',
            stops: { a: '#b03a2e', b: '#f9e79f', c: '#4a1c1a' },
            stripe: 'rgba(255,255,255,0.48)',
            bask: '#5d4035',
            baskEdge: 'rgba(25,15,8,0.35)',
            burnerMid: '#f7c948',
            burnerEnd: '#c0392b',
        },
        {
            kind: 'cool',
            stops: { a: '#1f6dad', b: '#d4e6f1', c: '#0a2c4a' },
            stripe: 'rgba(255,255,255,0.5)',
            bask: '#3d5a4a',
            baskEdge: 'rgba(0,0,0,0.28)',
            burnerMid: '#85c1e9',
            burnerEnd: '#154360',
        },
        {
            kind: 'warm',
            stops: { a: '#7d3c98', b: '#f5eef8', c: '#4a235a' },
            stripe: 'rgba(255,255,255,0.46)',
            bask: '#5d4e6b',
            baskEdge: 'rgba(30,15,35,0.38)',
            burnerMid: '#e8daef',
            burnerEnd: '#6c3483',
        },
        {
            kind: 'cool',
            stops: { a: '#148f77', b: '#eafaf1', c: '#0b5345' },
            stripe: 'rgba(255,255,255,0.52)',
            bask: '#4a6741',
            baskEdge: 'rgba(15,40,25,0.32)',
            burnerMid: '#82e0aa',
            burnerEnd: '#117864',
        },
        {
            kind: 'warm',
            stops: { a: '#e67e22', b: '#fdebd0', c: '#935116' },
            stripe: 'rgba(255,255,255,0.5)',
            bask: '#6e4c35',
            baskEdge: 'rgba(40,25,10,0.34)',
            burnerMid: '#fad7a0',
            burnerEnd: '#ca6f1e',
        },
        {
            kind: 'warm',
            stops: { a: '#c2185b', b: '#fadbd8', c: '#641e16' },
            stripe: 'rgba(255,255,255,0.48)',
            bask: '#633030',
            baskEdge: 'rgba(40,10,20,0.36)',
            burnerMid: '#f8bbd9',
            burnerEnd: '#880e4f',
        },
        {
            kind: 'cool',
            stops: { a: '#5c6bc0', b: '#e8eaf6', c: '#1a237e' },
            stripe: 'rgba(255,255,255,0.48)',
            bask: '#455a64',
            baskEdge: 'rgba(20,25,45,0.35)',
            burnerMid: '#c5cae9',
            burnerEnd: '#3949ab',
        },
        {
            kind: 'cool',
            stops: { a: '#0097a7', b: '#e0f7fa', c: '#004d40' },
            stripe: 'rgba(255,255,255,0.52)',
            bask: '#3d6b5c',
            baskEdge: 'rgba(0,45,40,0.32)',
            burnerMid: '#80deea',
            burnerEnd: '#00838f',
        },
        {
            kind: 'warm',
            stops: { a: '#f39c12', b: '#fef9e7', c: '#b7950b' },
            stripe: 'rgba(255,255,255,0.55)',
            bask: '#7d6608',
            baskEdge: 'rgba(80,55,0,0.35)',
            burnerMid: '#fde68a',
            burnerEnd: '#d68910',
        },
        {
            kind: 'warm',
            stops: { a: '#922b21', b: '#fadbd8', c: '#512e2f' },
            stripe: 'rgba(255,255,255,0.45)',
            bask: '#5d4037',
            baskEdge: 'rgba(35,15,12,0.38)',
            burnerMid: '#ec7063',
            burnerEnd: '#78281f',
        },
        {
            kind: 'cool',
            stops: { a: '#2471a3', b: '#eaf2f8', c: '#1b2631' },
            stripe: 'rgba(255,255,255,0.47)',
            bask: '#37474f',
            baskEdge: 'rgba(15,25,35,0.36)',
            burnerMid: '#aed6f1',
            burnerEnd: '#1f618d',
        },
        {
            kind: 'warm',
            stops: { a: '#27ae60', b: '#eafaf1', c: '#145a32' },
            stripe: 'rgba(255,255,255,0.5)',
            bask: '#4e6e50',
            baskEdge: 'rgba(15,45,25,0.32)',
            burnerMid: '#abebc6',
            burnerEnd: '#1e8449',
        },
    ];

    /**
     * Daha gerçekçi silüet, gölge, panel şeritleri, eğri halatlar, sepet lataları
     */
    function envelopeSvg(uid, pal) {
        var stops = pal.stops;
        var stripe = pal.stripe;
        var bask = pal.bask;
        var baskEdge = pal.baskEdge;

        var envPath =
            'M28 2.2 C11 2.2 1.8 15.5 1.8 28.5 C1.8 41.5 11.5 53.2 28 56.5 C44.5 53.2 54.2 41.5 54.2 28.5 C54.2 15.5 45 2.2 28 2.2 Z';

        return (
            '<svg class="balloon-svg" viewBox="0 0 56 78" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs>' +
            '<linearGradient id="env' +
            uid +
            '" x1="8%" y1="0%" x2="95%" y2="100%">' +
            '<stop offset="0%" stop-color="' +
            stops.a +
            '"/>' +
            '<stop offset="38%" stop-color="' +
            stops.b +
            '"/>' +
            '<stop offset="100%" stop-color="' +
            stops.c +
            '"/>' +
            '</linearGradient>' +
            '<radialGradient id="hi' +
            uid +
            '" cx="28%" cy="18%" r="52%">' +
            '<stop offset="0%" stop-color="#fff" stop-opacity="0.58"/>' +
            '<stop offset="40%" stop-color="#fff" stop-opacity="0.12"/>' +
            '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<radialGradient id="rim' +
            uid +
            '" cx="75%" cy="30%" r="35%">' +
            '<stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>' +
            '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<linearGradient id="sh' +
            uid +
            '" x1="50%" y1="0%" x2="50%" y2="100%">' +
            '<stop offset="0%" stop-color="rgba(0,0,0,0)"/>' +
            '<stop offset="100%" stop-color="rgba(0,0,0,0.18)"/>' +
            '</linearGradient>' +
            '<radialGradient id="br' +
            uid +
            '" cx="50%" cy="35%" r="65%">' +
            '<stop offset="0%" stop-color="#fffef2"/>' +
            '<stop offset="30%" stop-color="' +
            pal.burnerMid +
            '"/>' +
            '<stop offset="100%" stop-color="' +
            pal.burnerEnd +
            '" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<pattern id="wv' +
            uid +
            '" width="2.2" height="2.2" patternUnits="userSpaceOnUse">' +
            '<path d="M0 2.2 L2.2 0 M0 0 L2.2 2.2" stroke="rgba(0,0,0,0.2)" stroke-width="0.22"/>' +
            '</pattern>' +
            '<clipPath id="cp' +
            uid +
            '">' +
            '<path d="' +
            envPath +
            '"/>' +
            '</clipPath>' +
            '</defs>' +
            '<ellipse cx="28" cy="71.5" rx="14" ry="2.2" fill="rgba(0,0,0,0.07)"/>' +
            '<g clip-path="url(#cp' +
            uid +
            ')">' +
            '<path d="' +
            envPath +
            '" fill="url(#env' +
            uid +
            ')" stroke="rgba(0,0,0,0.14)" stroke-width="0.5"/>' +
            '<path d="' +
            envPath +
            '" fill="url(#hi' +
            uid +
            ')"/>' +
            '<path d="' +
            envPath +
            '" fill="url(#rim' +
            uid +
            ')"/>' +
            '<ellipse cx="28" cy="48" rx="22" ry="14" fill="url(#sh' +
            uid +
            ')"/>' +
            '<g stroke="' +
            stripe +
            '" stroke-width="0.85" fill="none" opacity="0.42">' +
            '<path d="M11 6 Q9 28 12 52"/>' +
            '<path d="M17 4 Q15 28 17 54"/>' +
            '<path d="M23 3 Q22 28 23 55"/>' +
            '<path d="M28 2.5 Q27 28 28 56"/>' +
            '<path d="M33 3 Q34 28 33 55"/>' +
            '<path d="M39 4 Q41 28 39 54"/>' +
            '<path d="M45 6 Q47 28 44 52"/>' +
            '</g>' +
            '</g>' +
            '<path d="M18.5 53 Q19 58 20.5 62.5" stroke="rgba(42,30,18,0.62)" stroke-width="0.85" fill="none" stroke-linecap="round"/>' +
            '<path d="M28 54 Q28 58 28 63.2" stroke="rgba(42,30,18,0.62)" stroke-width="0.85" fill="none" stroke-linecap="round"/>' +
            '<path d="M37.5 53 Q36 58 35.5 62.5" stroke="rgba(42,30,18,0.62)" stroke-width="0.85" fill="none" stroke-linecap="round"/>' +
            '<ellipse cx="28" cy="60.5" rx="5" ry="3.2" fill="url(#br' +
            uid +
            ')" class="balloon-burner-glow"/>' +
            '<rect x="17" y="62.8" width="22" height="6" rx="1.4" fill="' +
            bask +
            '" stroke="' +
            baskEdge +
            '" stroke-width="0.5"/>' +
            '<rect x="17" y="62.8" width="22" height="6" rx="1.4" fill="url(#wv' +
            uid +
            ')" opacity="0.45"/>' +
            '<line x1="21" y1="63.5" x2="21" y2="67.8" stroke="rgba(0,0,0,0.18)" stroke-width="0.35"/>' +
            '<line x1="28" y1="63.5" x2="28" y2="67.8" stroke="rgba(0,0,0,0.18)" stroke-width="0.35"/>' +
            '<line x1="35" y1="63.5" x2="35" y2="67.8" stroke="rgba(0,0,0,0.18)" stroke-width="0.35"/>' +
            '<rect x="17.8" y="62.5" width="20.4" height="1.1" rx="0.35" fill="rgba(255,255,255,0.15)"/>' +
            '<rect x="17.8" y="67.2" width="20.4" height="0.55" rx="0.15" fill="rgba(0,0,0,0.15)"/>' +
            '</svg>'
        );
    }

    var w = window.innerWidth;
    var count = w < 480 ? 9 : w < 900 ? 12 : 16;
    /** Küçük ölçek + küçük taban boyut çarpılınca SVG tek renk leke + kutu gibi görünüyor */
    var sizeBoost = w < 480 ? 1 : w < 900 ? 1.12 : 1.22;

    for (var i = 0; i < count; i++) {
        var left = 3 + Math.random() * 94;
        var dur = 40 + Math.random() * 55;
        var delay = -Math.random() * dur;
        var scale = 0.52 + Math.random() * 0.34;
        var driftPx = -40 + Math.random() * 80;
        var drift = driftPx + 'px';
        var pal = BALLOON_PALETTES[Math.floor(Math.random() * BALLOON_PALETTES.length)];
        var hueNudge = ((Math.random() * 14 - 7) | 0) + 'deg';
        var envW = Math.round((48 + Math.random() * 34) * sizeBoost);
        var envH = Math.round((58 + Math.random() * 38) * sizeBoost);
        var opacityMid = (0.4 + Math.random() * 0.22).toFixed(3);
        var uid = 'u' + i + '_' + ((Math.random() * 1e6) | 0);

        var unit = document.createElement('div');
        unit.className = 'balloon-unit';
        unit.style.setProperty('--left', left + '%');
        unit.style.setProperty('--hue', hueNudge);

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
        env.innerHTML = envelopeSvg(uid, pal);

        inner.appendChild(env);
        unit.appendChild(inner);
        sky.appendChild(unit);
    }
})();
