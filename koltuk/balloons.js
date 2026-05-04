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
     * Inline SVG: gradient gövde, parlama, dikey şeritler, üç ip, brülör alevi, örgülü sepet.
     */
    function envelopeSvg(uid, isSky) {
        var stops = isSky
            ? { a: '#48c9e8', b: '#d6eaf8', c: '#154360' }
            : { a: '#ec7063', b: '#fdebd0', c: '#641e16' };
        var stripe = isSky ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.5)';
        return (
            '<svg class="balloon-svg" viewBox="0 0 48 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<defs>' +
            '<linearGradient id="env' +
            uid +
            '" x1="10%" y1="0%" x2="92%" y2="100%">' +
            '<stop offset="0%" stop-color="' +
            stops.a +
            '"/>' +
            '<stop offset="42%" stop-color="' +
            stops.b +
            '"/>' +
            '<stop offset="100%" stop-color="' +
            stops.c +
            '"/>' +
            '</linearGradient>' +
            '<radialGradient id="hi' +
            uid +
            '" cx="30%" cy="20%" r="55%">' +
            '<stop offset="0%" stop-color="#fff" stop-opacity="0.5"/>' +
            '<stop offset="45%" stop-color="#fff" stop-opacity="0.1"/>' +
            '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<radialGradient id="br' +
            uid +
            '" cx="50%" cy="40%" r="60%">' +
            '<stop offset="0%" stop-color="#fffce8"/>' +
            '<stop offset="35%" stop-color="#f8b739"/>' +
            '<stop offset="100%" stop-color="#ca6f1e" stop-opacity="0"/>' +
            '</radialGradient>' +
            '<pattern id="wv' +
            uid +
            '" width="2.5" height="2.5" patternUnits="userSpaceOnUse">' +
            '<path d="M0 2.5 L2.5 0 M-0.5 0.5 L0.5 -0.5" stroke="rgba(0,0,0,0.22)" stroke-width="0.28"/>' +
            '</pattern>' +
            '<clipPath id="cp' +
            uid +
            '">' +
            '<path d="M24 2 C9 2 1.5 15.5 1.5 27.5 C1.5 39.5 11 49.5 24 52.5 C37 49.5 46.5 39.5 46.5 27.5 C46.5 15.5 39 2 24 2 Z"/>' +
            '</clipPath>' +
            '</defs>' +
            '<g clip-path="url(#cp' +
            uid +
            ')">' +
            '<path d="M24 2 C9 2 1.5 15.5 1.5 27.5 C1.5 39.5 11 49.5 24 52.5 C37 49.5 46.5 39.5 46.5 27.5 C46.5 15.5 39 2 24 2 Z" fill="url(#env' +
            uid +
            ')" stroke="rgba(0,0,0,0.12)" stroke-width="0.45"/>' +
            '<path d="M24 2 C9 2 1.5 15.5 1.5 27.5 C1.5 39.5 11 49.5 24 52.5 C37 49.5 46.5 39.5 46.5 27.5 C46.5 15.5 39 2 24 2 Z" fill="url(#hi' +
            uid +
            ')"/>' +
            '<g stroke="' +
            stripe +
            '" stroke-width="1" fill="none" opacity="0.38">' +
            '<path d="M14 5 Q11 25 13.5 48"/>' +
            '<path d="M24 3 Q22 26 24 51"/>' +
            '<path d="M34 5 Q37 25 34.5 48"/>' +
            '</g>' +
            '</g>' +
            '<line x1="17.5" y1="50.5" x2="19.5" y2="58" stroke="rgba(45,32,20,0.58)" stroke-width="0.85" stroke-linecap="round"/>' +
            '<line x1="24" y1="51.5" x2="24" y2="58.5" stroke="rgba(45,32,20,0.58)" stroke-width="0.85" stroke-linecap="round"/>' +
            '<line x1="30.5" y1="50.5" x2="28.5" y2="58" stroke="rgba(45,32,20,0.58)" stroke-width="0.85" stroke-linecap="round"/>' +
            '<ellipse cx="24" cy="56.2" rx="4.5" ry="3" fill="url(#br' +
            uid +
            ')" class="balloon-burner-glow"/>' +
            '<rect x="16.5" y="58.5" width="15" height="5.2" rx="1.3" fill="#5d4035" stroke="rgba(0,0,0,0.25)" stroke-width="0.45"/>' +
            '<rect x="16.5" y="58.5" width="15" height="5.2" rx="1.3" fill="url(#wv' +
            uid +
            ')"/>' +
            '<rect x="17.5" y="59.2" width="13" height="0.6" rx="0.2" fill="rgba(0,0,0,0.12)"/>' +
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
        var envW = 22 + Math.random() * 14;
        var envH = 28 + Math.random() * 14;
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
