// Instalator Stanisław Dłubak - interakcje strony (projekt „szyld”, 01.10.2026).
// Każdy blok osobno w try/catch: awaria jednego efektu nie zatrzymuje reszty strony.

// --- menu na telefonie ---
(function () {
  try {
    var nav = document.querySelector('.nav');
    var btn = document.querySelector('.nav-toggle');
    if (!nav || !btn) return;
    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  } catch (e) {}
})();

// --- pasek nawigacji po zjechaniu w dół ---
(function () {
  try {
    var nav = document.querySelector('.nav');
    if (!nav) return;
    var tick = false;
    function upd() { nav.classList.toggle('is-stuck', window.scrollY > 12); tick = false; }
    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(upd); }
    }, { passive: true });
    upd();
  } catch (e) {}
})();

// --- odsłanianie sekcji ---
// Odsłaniamy wszystko, co jest NAD dolną krawędzią okna (także to, co przeskoczono
// szybkim przewinięciem). Zabezpieczenie: po 3 s odsłaniamy resztę widocznego ekranu.
(function () {
  try {
    window.__nbOk = true;
    var els = [].slice.call(document.querySelectorAll('.reveal'));
    if (!els.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    // stagger w obrębie wspólnego rodzica
    var rodzice = [];
    els.forEach(function (el) {
      var p = el.parentElement;
      if (rodzice.indexOf(p) === -1) rodzice.push(p);
    });
    rodzice.forEach(function (p) {
      var dzieci = [].filter.call(p.children, function (c) { return c.classList.contains('reveal'); });
      if (dzieci.length > 1) dzieci.forEach(function (c, i) { c.style.setProperty('--i', Math.min(i, 6)); });
    });
    var czeka = els.slice();
    var tick = false;
    function sprawdz() {
      var granica = window.innerHeight * 0.94;
      czeka = czeka.filter(function (el) {
        if (el.getBoundingClientRect().top < granica) { el.classList.add('in'); return false; }
        return true;
      });
      tick = false;
    }
    window.addEventListener('scroll', function () {
      if (!tick) { tick = true; requestAnimationFrame(sprawdz); }
    }, { passive: true });
    window.addEventListener('resize', sprawdz);
    window.addEventListener('load', sprawdz);
    requestAnimationFrame(sprawdz);
    setTimeout(sprawdz, 3000);
  } catch (e) {
    [].forEach.call(document.querySelectorAll('.reveal'), function (el) { el.classList.add('in'); });
  }
})();

// --- podpis „sklep teraz” pod zdjęciem wejścia (godziny z wizytówki Google: pn-pt 9-17, sob 9-14) ---
(function () {
  try {
    var karty = document.querySelectorAll('[data-sklep-stan]');
    if (!karty.length) return;
    var GODZ = { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 14] };
    var DNI = ['w niedzielę', 'w poniedziałek', 'we wtorek', 'w środę', 'w czwartek', 'w piątek', 'w sobotę'];
    var teraz = new Date();
    var d = teraz.getDay(), h = teraz.getHours() + teraz.getMinutes() / 60;
    var dzis = GODZ[d];
    var otwarte = !!(dzis && h >= dzis[0] && h < dzis[1]);
    var tekst;
    if (otwarte) {
      tekst = 'Otwarte teraz, do ' + dzis[1] + ':00';
    } else {
      var kiedy = '';
      if (dzis && h < dzis[0]) kiedy = 'dziś o ' + dzis[0] + ':00';
      else {
        for (var i = 1; i <= 7; i++) {
          var n = (d + i) % 7;
          if (GODZ[n]) { kiedy = (i === 1 ? 'jutro' : DNI[n]) + ' o ' + GODZ[n][0] + ':00'; break; }
        }
      }
      tekst = 'Zamknięte, otwieramy ' + kiedy;
    }
    [].forEach.call(karty, function (k) {
      var s = k.querySelector('.sc-stan');
      if (s) s.textContent = tekst;
      k.classList.toggle('is-open', otwarte);
    });
    // podświetlenie dzisiejszego dnia w tabeli godzin
    [].forEach.call(document.querySelectorAll('[data-dzien="' + d + '"]'), function (el) { el.classList.add('dzis'); });
  } catch (e) {}
})();

// --- powiększanie zdjęć w galerii ---
(function () {
  try {
    var kafle = document.querySelectorAll('.m-tile');
    if (!kafle.length) return;
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML = '<button class="lb-x" type="button" aria-label="Zamknij">×</button><img alt="">';
    document.body.appendChild(lb);
    var img = lb.querySelector('img');
    function zamknij() { lb.classList.remove('open'); img.removeAttribute('src'); document.body.style.overflow = ''; }
    [].forEach.call(kafle, function (k) {
      k.addEventListener('click', function () {
        var src = k.getAttribute('data-full') || (k.querySelector('img') || {}).src;
        if (!src) return;
        img.src = src;
        img.alt = (k.querySelector('img') || {}).alt || '';
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    lb.addEventListener('click', zamknij);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });
  } catch (e) {}
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08: pełne odliczanie dni/godzin/minut/sekund).
// Nie wita klienta przy wejściu - wjeżdża po zejściu z pierwszego ekranu i chowa się po powrocie na górę.
(function () {
  try {
    var el = document.querySelector('.demo-wazne');
    if (!el || !el.getAttribute('data-do')) return;
    var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
    if (isNaN(koniec)) return;
    var txt = el.querySelector('.dw-txt') || el;
    var dwa = function (n) { return (n < 10 ? '0' : '') + n; };
    var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);
    function tyka() {
      var teraz = new Date(), ms = koniec - teraz;
      while (ms <= 0 && cykl > 0) {
        koniec = new Date(koniec.getTime() + cykl * 86400000);
        ms = koniec - teraz;
      }
      if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
      var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
      var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
      var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
      txt.innerHTML = d > 0
        ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
        : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
      el.classList.toggle('is-pilne', d === 0);
      return true;
    }
    if (tyka() !== false) setInterval(tyka, 1000);
    el.hidden = false;
    var tick = false;
    function stan() {
      el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
      tick = false;
    }
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true; requestAnimationFrame(stan);
    }, { passive: true });
    stan();
  } catch (e) {}
})();

/* === DOLNY PASEK MOBILE: chowa się, gdy na ekranie są te same przyciski (hero, CTA, stopka) === */
(function () {
  try {
    var pasek = document.querySelector('.sticky-call');
    if (!pasek || !('IntersectionObserver' in window)) return;
    var cele = document.querySelectorAll('.hero-szyld, .ph-sklep, footer, .cta');
    if (!cele.length) return;
    var widoczne = [];
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) {
        var i = widoczne.indexOf(w.target);
        if (w.isIntersecting && i === -1) widoczne.push(w.target);
        if (!w.isIntersecting && i !== -1) widoczne.splice(i, 1);
      });
      pasek.classList.toggle('schowany', widoczne.length > 0);
    }, { threshold: 0.01 });
    cele.forEach(function (el) { io.observe(el); });
  } catch (e) {}
})();

/* === STOPKLATKA: zdjęcie pokazujemy dopiero, gdy sekcja jest blisko ekranu === */
(function () {
  try {
    var sek = document.querySelectorAll('.stopklatka');
    if (!sek.length) return;
    if (!('IntersectionObserver' in window)) {
      [].forEach.call(sek, function (s) { s.classList.add('blisko'); });
      return;
    }
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { w.target.classList.toggle('blisko', w.isIntersecting); });
    }, { rootMargin: '300px 0px' });
    [].forEach.call(sek, function (s) { io.observe(s); });
  } catch (e) {
    [].forEach.call(document.querySelectorAll('.stopklatka'), function (s) { s.classList.add('blisko'); });
  }
})();


/* === licznik otwarć demo (buy-signal) v3 — geo po stronie serwera === */
(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
