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
     * Daha gerçekçi silüet, gölge, panel şeritleri, eğri halatlar, sepet lataları
     */
    function envelopeSvg(uid, isSky) {
        var stops = isSky
            ? { a: '#1f6dad', b: '#d4e6f1', c: '#0a2c4a' }
            : { a: '#b03a2e', b: '#f9e79f', c: '#4a1c1a' };
        var stripe = isSky ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.48)';
        var bask = isSky ? '#3d5a4a' : '#5d4035';
        var baskEdge = isSky ? 'rgba(0,0,0,0.28)' : 'rgba(25,15,8,0.35)';

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
            '<stop offset="30%" stop-color="#f7c948"/>' +
            '<stop offset="100%" stop-color="#c0392b" stop-opacity="0"/>' +
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
    var huesWarm = ['-8deg', '0deg', '14deg', '24deg', '38deg', '318deg', '335deg'];
    var huesSky = ['-4deg', '0deg', '6deg', '12deg', '198deg', '205deg'];

    for (var i = 0; i < count; i++) {
        var left = 3 + Math.random() * 94;
        var dur = 40 + Math.random() * 55;
        var delay = -Math.random() * dur;
        var scale = 0.26 + Math.random() * 0.4;
        var driftPx = -40 + Math.random() * 80;
        var drift = driftPx + 'px';
        var isSky = Math.random() > 0.45;
        var hueList = isSky ? huesSky : huesWarm;
        var hue = hueList[Math.floor(Math.random() * hueList.length)];
        var envW = 24 + Math.random() * 14;
        var envH = 30 + Math.random() * 14;
        var opacityMid = (0.4 + Math.random() * 0.22).toFixed(3);
        var uid = 'u' + i + '_' + ((Math.random() * 1e6) | 0);

        var unit = document.createElement('div');
        unit.className = 'balloon-unit';
        unit.style.setProperty('--left', left + '%');
        unit.style.setProperty('--hue', hue);

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
            (isSky ? ' balloon-envelope--sky' : ' balloon-envelope--warm');
        env.style.setProperty('--env-w', envW + 'px');
        env.style.setProperty('--env-h', envH + 'px');
        env.innerHTML = envelopeSvg(uid, isSky);

        inner.appendChild(env);
        unit.appendChild(inner);
        sky.appendChild(unit);
    }
})();
