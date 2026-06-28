(function () {
  'use strict';

  document.body.classList.add('lusi-unified-blog');

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = typeof window.IntersectionObserver === 'function';

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  // ---------------------------------------------------------------------------
  // Reading progress bar — tracks scroll progress through the longform article.
  // ---------------------------------------------------------------------------
  function initProgress(article) {
    var bar = document.createElement('div');
    bar.className = 'lusi-progress';
    bar.setAttribute('aria-hidden', 'true');
    var fill = document.createElement('span');
    bar.appendChild(fill);
    document.body.appendChild(bar);

    var ticking = false;
    function update() {
      ticking = false;
      var rect = article.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var total = rect.height - vh;
      var pct;
      if (total <= 0) {
        pct = rect.bottom <= vh ? 100 : 0;
      } else {
        pct = ((vh - rect.top) / (rect.height)) * 100;
      }
      pct = Math.max(0, Math.min(100, pct));
      fill.style.width = pct.toFixed(2) + '%';
    }
    function onScroll() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // ---------------------------------------------------------------------------
  // Scroll reveal — fade/slide top-level article blocks in as they enter view.
  // Gated behind body.lusi-reveal-ready so the CSS hidden state only applies
  // once JS is running (no flash of invisible text if the script fails to load).
  // ---------------------------------------------------------------------------
  function initReveal(article) {
    if (reduceMotion || !hasIO) return;

    var selector =
      ':scope > p, :scope > h2, :scope > ul, :scope > ol, :scope > .lusi-pullquote, ' +
      ':scope > .lusi-home-hero-panel, :scope > .lusi-stat-row, :scope > .lusi-tabs, ' +
      ':scope > .lusi-quiz, :scope > details';
    var nodes;
    try {
      nodes = article.querySelectorAll(selector);
    } catch (e) {
      return; // :scope unsupported — skip reveal entirely.
    }
    if (!nodes.length) return;

    document.body.classList.add('lusi-reveal-ready');

    var vh = window.innerHeight || document.documentElement.clientHeight;
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );

    Array.prototype.forEach.call(nodes, function (node) {
      node.setAttribute('data-reveal', '');
      // Reveal anything already in view immediately to avoid a flash.
      var top = node.getBoundingClientRect().top;
      if (top < vh * 0.9) {
        node.classList.add('is-visible');
      } else {
        observer.observe(node);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Animated counters — count [data-count-to] elements up from 0 on first view.
  // ---------------------------------------------------------------------------
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count-to'));
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-count-prefix') || '';
    var suffix = el.getAttribute('data-count-suffix') || '';
    var decimals = (String(target).split('.')[1] || '').length;
    var group = el.getAttribute('data-count-group') === 'true';

    function render(value) {
      // German formatting: comma decimals, optional "." thousands grouping
      // (opt-in via data-count-group so years like 2024 stay ungrouped).
      var num = group
        ? value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : value.toFixed(decimals).replace('.', ',');
      el.textContent = prefix + num + suffix;
    }

    if (reduceMotion) {
      render(target);
      return;
    }

    var duration = 1200;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      render(target * eased);
      if (p < 1) window.requestAnimationFrame(step);
      else render(target);
    }
    window.requestAnimationFrame(step);
  }

  function initCounters() {
    var els = document.querySelectorAll('[data-count-to]');
    if (!els.length) return;

    if (reduceMotion || !hasIO) {
      Array.prototype.forEach.call(els, animateCount);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    Array.prototype.forEach.call(els, function (el) {
      observer.observe(el);
    });
  }

  // ---------------------------------------------------------------------------
  // Tabs — wire [data-tabs] groups. Without .is-enhanced the CSS shows every
  // panel stacked (readable fallback); JS adds it to enable single-panel view.
  // ---------------------------------------------------------------------------
  function initTabs() {
    var groups = document.querySelectorAll('[data-tabs]');
    Array.prototype.forEach.call(groups, function (group) {
      var btns = group.querySelectorAll('.lusi-tab-btn');
      var panels = group.querySelectorAll('.lusi-tab-panel');
      if (!btns.length || btns.length !== panels.length) return;

      function activate(index) {
        Array.prototype.forEach.call(btns, function (b, i) {
          var on = i === index;
          b.classList.toggle('is-active', on);
          b.setAttribute('aria-selected', on ? 'true' : 'false');
          b.setAttribute('tabindex', on ? '0' : '-1');
        });
        Array.prototype.forEach.call(panels, function (p, i) {
          p.classList.toggle('is-active', i === index);
        });
      }

      Array.prototype.forEach.call(btns, function (btn, i) {
        btn.setAttribute('role', 'tab');
        btn.addEventListener('click', function () {
          activate(i);
        });
        btn.addEventListener('keydown', function (e) {
          var next;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % btns.length;
          else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + btns.length) % btns.length;
          if (next != null) {
            e.preventDefault();
            activate(next);
            btns[next].focus();
          }
        });
      });

      group.classList.add('is-enhanced');
      activate(0);
    });
  }

  // ---------------------------------------------------------------------------
  // Quiz — mark an option right/wrong against data-answer, reveal feedback.
  // ---------------------------------------------------------------------------
  function initQuiz() {
    var items = document.querySelectorAll('[data-quiz] .lusi-quiz-item');
    Array.prototype.forEach.call(items, function (item) {
      var answer = parseInt(item.getAttribute('data-answer'), 10);
      var opts = item.querySelectorAll('.lusi-quiz-opt');
      var feedback = item.querySelector('.lusi-quiz-feedback');

      Array.prototype.forEach.call(opts, function (opt, i) {
        opt.setAttribute('type', 'button');
        opt.addEventListener('click', function () {
          if (item.classList.contains('is-answered')) return;
          item.classList.add('is-answered');
          var correct = i === answer;
          opt.classList.add(correct ? 'is-correct' : 'is-wrong');
          if (!correct && opts[answer]) opts[answer].classList.add('is-correct');
          Array.prototype.forEach.call(opts, function (o) {
            o.disabled = true;
          });
          if (feedback) {
            feedback.classList.toggle('is-correct', correct);
            feedback.classList.toggle('is-wrong', !correct);
            feedback.hidden = false;
          }
        });
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Back-to-top button — appears after scrolling, returns to the top.
  // ---------------------------------------------------------------------------
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.className = 'lusi-to-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Nach oben');
    btn.innerHTML = '<span aria-hidden="true">↑</span>';
    document.body.appendChild(btn);

    var ticking = false;
    function update() {
      ticking = false;
      btn.classList.toggle('is-visible', window.pageYOffset > 600);
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    update();
  }

  ready(function () {
    var article = document.querySelector('article.lusi-longform-copy');
    if (article) {
      initProgress(article);
      initReveal(article);
      initBackToTop();
    }
    initCounters();
    initTabs();
    initQuiz();
  });
})();
