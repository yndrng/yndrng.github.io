// Pan / zoom / tooltip / click-to-focus layer for the world map in travel.html.
// Progressive enhancement only: travel.py already emits a fully coloured, correctly
// labelled SVG (with native <title> tooltips), so this script degrades to nothing if
// it fails to run — the map still works, it just can't be panned or zoomed.
(function () {
  "use strict";

  var svg = document.querySelector(".worldmap");
  if (!svg) return;

  var tip = document.getElementById("map-tip");
  var resetLink = document.getElementById("map-reset");

  var parts = svg.getAttribute("viewBox").split(/\s+/).map(Number);
  var fullBox = { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
  var box = { x: fullBox.x, y: fullBox.y, w: fullBox.w, h: fullBox.h };

  var MIN_ZOOM = 1, MAX_ZOOM = 40;

  function currentZoom() {
    return fullBox.w / box.w;
  }

  function clampBox(next) {
    // Don't allow zooming out past the world, or panning the world out of view.
    next.w = Math.min(fullBox.w, Math.max(fullBox.w / MAX_ZOOM, next.w));
    next.h = next.w * (fullBox.h / fullBox.w);
    var maxX = fullBox.x + fullBox.w - next.w;
    var maxY = fullBox.y + fullBox.h - next.h;
    next.x = Math.min(Math.max(next.x, fullBox.x), Math.max(fullBox.x, maxX));
    next.y = Math.min(Math.max(next.y, fullBox.y), Math.max(fullBox.y, maxY));
    return next;
  }

  function applyBox() {
    svg.setAttribute(
      "viewBox",
      box.x.toFixed(1) + " " + box.y.toFixed(1) + " " + box.w.toFixed(1) + " " + box.h.toFixed(1)
    );
    // Keep dots and strokes a constant on-screen size regardless of zoom level.
    var scale = box.w / fullBox.w;
    var cities = svg.querySelectorAll("circle.city");
    for (var i = 0; i < cities.length; i++) {
      cities[i].setAttribute("r", (2 * scale).toFixed(2));
      cities[i].style.strokeWidth = (0.5 * scale).toFixed(2);
    }
    svg.style.setProperty("--stroke-scale", scale.toFixed(3));
  }

  function svgPoint(clientX, clientY) {
    var rect = svg.getBoundingClientRect();
    var relX = (clientX - rect.left) / rect.width;
    var relY = (clientY - rect.top) / rect.height;
    return { x: box.x + relX * box.w, y: box.y + relY * box.h };
  }

  function zoomAt(clientX, clientY, factor) {
    var pt = svgPoint(clientX, clientY);
    var newW = box.w / factor;
    var newH = box.h / factor;
    var next = {
      x: pt.x - (pt.x - box.x) * (newW / box.w),
      y: pt.y - (pt.y - box.y) * (newH / box.h),
      w: newW,
      h: newH,
    };
    box = clampBox(next);
    applyBox();
  }

  function panBy(dxClient, dyClient) {
    var rect = svg.getBoundingClientRect();
    var dx = (dxClient / rect.width) * box.w;
    var dy = (dyClient / rect.height) * box.h;
    box = clampBox({ x: box.x - dx, y: box.y - dy, w: box.w, h: box.h });
    applyBox();
  }

  function focusOn(pathEl) {
    var bbox = pathEl.getBBox();
    var pad = Math.max(bbox.width, bbox.height) * 0.25 || 5;
    var next = {
      x: bbox.x - pad,
      y: bbox.y - pad,
      w: bbox.width + pad * 2,
      h: bbox.height + pad * 2,
    };
    // Preserve the world's aspect ratio so the map doesn't stretch.
    var aspect = fullBox.w / fullBox.h;
    if (next.w / next.h > aspect) {
      var targetH = next.w / aspect;
      next.y -= (targetH - next.h) / 2;
      next.h = targetH;
    } else {
      var targetW = next.h * aspect;
      next.x -= (targetW - next.w) / 2;
      next.w = targetW;
    }
    box = clampBox(next);
    applyBox();
  }

  function resetView() {
    box = { x: fullBox.x, y: fullBox.y, w: fullBox.w, h: fullBox.h };
    applyBox();
  }

  // --- Wheel zoom, centred on the cursor ---
  svg.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      var factor = Math.pow(1.0025, -e.deltaY);
      zoomAt(e.clientX, e.clientY, factor);
    },
    { passive: false }
  );

  // --- Drag to pan (mouse) ---
  var dragging = false;
  var lastX = 0, lastY = 0;
  var moved = false;

  svg.addEventListener("mousedown", function (e) {
    if (e.button !== 0) return;
    dragging = true;
    moved = false;
    lastX = e.clientX;
    lastY = e.clientY;
    svg.classList.add("dragging");
  });

  window.addEventListener("mousemove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) moved = true;
    panBy(dx, dy);
    lastX = e.clientX;
    lastY = e.clientY;
  });

  window.addEventListener("mouseup", function () {
    dragging = false;
    svg.classList.remove("dragging");
  });

  // --- Touch: one-finger pan, two-finger pinch zoom ---
  var touchState = null;

  function touchDist(t0, t1) {
    return Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
  }
  function touchMid(t0, t1) {
    return { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
  }

  svg.addEventListener(
    "touchstart",
    function (e) {
      if (e.touches.length === 1) {
        touchState = { mode: "pan", x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchState = { mode: "pinch", dist: touchDist(e.touches[0], e.touches[1]) };
      }
    },
    { passive: true }
  );

  svg.addEventListener(
    "touchmove",
    function (e) {
      if (!touchState) return;
      e.preventDefault();
      if (touchState.mode === "pan" && e.touches.length === 1) {
        var t = e.touches[0];
        panBy(t.clientX - touchState.x, t.clientY - touchState.y);
        touchState.x = t.clientX;
        touchState.y = t.clientY;
      } else if (touchState.mode === "pinch" && e.touches.length === 2) {
        var d = touchDist(e.touches[0], e.touches[1]);
        var mid = touchMid(e.touches[0], e.touches[1]);
        zoomAt(mid.x, mid.y, d / touchState.dist);
        touchState.dist = d;
      }
    },
    { passive: false }
  );

  svg.addEventListener("touchend", function () {
    touchState = null;
  });

  // --- Keyboard: +/- to zoom, arrows to pan ---
  svg.addEventListener("keydown", function (e) {
    var rect = svg.getBoundingClientRect();
    var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    switch (e.key) {
      case "+":
      case "=":
        zoomAt(cx, cy, 1.3);
        e.preventDefault();
        break;
      case "-":
        zoomAt(cx, cy, 1 / 1.3);
        e.preventDefault();
        break;
      case "ArrowLeft":
        panBy(40, 0);
        e.preventDefault();
        break;
      case "ArrowRight":
        panBy(-40, 0);
        e.preventDefault();
        break;
      case "ArrowUp":
        panBy(0, 40);
        e.preventDefault();
        break;
      case "ArrowDown":
        panBy(0, -40);
        e.preventDefault();
        break;
    }
  });

  // --- Click a visited country to zoom to it; double-click background to reset ---
  svg.addEventListener("click", function (e) {
    if (moved) {
      moved = false;
      return;
    }
    var el = e.target;
    if (el.classList && el.classList.contains("visited")) {
      focusOn(el);
    }
  });

  svg.addEventListener("dblclick", function (e) {
    if (!e.target.closest(".visited, .city")) resetView();
  });

  if (resetLink) {
    resetLink.addEventListener("click", function (e) {
      e.preventDefault();
      resetView();
    });
  }

  // --- Tooltip on hover / keyboard focus for countries and cities ---
  function showTip(el, clientX, clientY) {
    if (!tip) return;
    var name = el.getAttribute("data-name");
    if (!name) return;
    var years = el.getAttribute("data-years");
    var note = el.getAttribute("data-note");
    var html = name;
    if (years) html += " — " + years;
    if (note) html += " · " + note;
    tip.textContent = html;
    tip.hidden = false;
    positionTip(clientX, clientY);
  }

  function positionTip(clientX, clientY) {
    if (!tip || tip.hidden) return;
    tip.style.left = clientX + 12 + "px";
    tip.style.top = clientY + 12 + "px";
  }

  function hideTip() {
    if (tip) tip.hidden = true;
  }

  svg.addEventListener("mousemove", function (e) {
    var el = e.target;
    if (el.classList && (el.classList.contains("visited") || el.classList.contains("city"))) {
      showTip(el, e.clientX, e.clientY);
    } else {
      hideTip();
    }
  });

  svg.addEventListener("mouseleave", hideTip);

  svg.addEventListener(
    "focus",
    function (e) {
      var el = e.target;
      if (el.classList && (el.classList.contains("visited") || el.classList.contains("city"))) {
        var rect = el.getBoundingClientRect();
        showTip(el, rect.left + rect.width / 2, rect.top);
      }
    },
    true
  );

  svg.addEventListener("blur", hideTip, true);

  applyBox();
})();
