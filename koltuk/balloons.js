(function initBalloons() {
    const sky = document.getElementById('balloon-sky');
    if (!sky) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        sky.remove();
        return;
    }

    var w = window.innerWidth;
    var count = w < 480 ? 9 : w < 900 ? 12 : 16;
    var hues = ['-8deg', '0deg', '14deg', '24deg', '38deg', '195deg', '205deg', '318deg', '335deg'];

    for (var i = 0; i < count; i++) {
        var left = 3 + Math.random() * 94;
        var dur = 40 + Math.random() * 55;
        var delay = -Math.random() * dur;
        var scale = 0.26 + Math.random() * 0.4;
        var driftPx = -40 + Math.random() * 80;
        var drift = driftPx + 'px';
        var hue = hues[Math.floor(Math.random() * hues.length)];
        var envW = 20 + Math.random() * 12;
        var envH = 26 + Math.random() * 12;
        var opacityMid = (0.4 + Math.random() * 0.22).toFixed(3);

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
        env.className = 'balloon-envelope';
        env.style.setProperty('--env-w', envW + 'px');
        env.style.setProperty('--env-h', envH + 'px');

        var rig = document.createElement('div');
        rig.className = 'balloon-rig';
        var ropeA = document.createElement('span');
        ropeA.className = 'balloon-rope';
        var ropeB = document.createElement('span');
        ropeB.className = 'balloon-rope';
        rig.appendChild(ropeA);
        rig.appendChild(ropeB);

        var basket = document.createElement('div');
        basket.className = 'balloon-basket';

        inner.appendChild(env);
        inner.appendChild(rig);
        inner.appendChild(basket);
        unit.appendChild(inner);
        sky.appendChild(unit);
    }
})();
