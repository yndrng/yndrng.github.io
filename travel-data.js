// Colours visited countries and draws city dots on the base map built by travel.py,
// using the life-app API. map.js handles pan / zoom / tooltips on top of this.
(function () {
  "use strict";

  var svg = document.querySelector(".worldmap");
  var count = document.getElementById("map-count");
  if (!svg) return;

  // Equal Earth projection — must match travel.py exactly (same constants, x200 scale).
  var A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
  function equalEarth(lon, lat) {
    var lam = (lon * Math.PI) / 180;
    var phi = (lat * Math.PI) / 180;
    var t = Math.asin((Math.sqrt(3) / 2) * Math.sin(phi));
    var t2 = t * t, t6 = Math.pow(t, 6);
    var x = (2 * Math.sqrt(3) * lam * Math.cos(t)) / (3 * (9 * A4 * t6 * t2 + 7 * A3 * t6 + 3 * A2 * t2 + A1));
    var y = A4 * t6 * t2 * t + A3 * t6 * t + A2 * t2 * t + A1 * t;
    return [Math.round(x * 2000) / 10, Math.round(-y * 2000) / 10];
  }

  var NS = "http://www.w3.org/2000/svg";
  function label(name, years, note) {
    var s = name;
    if (years) s += " — " + years;
    if (note) s += " · " + note;
    return s;
  }
  function setTitle(el, text) {
    var t = el.querySelector("title") || el.appendChild(document.createElementNS(NS, "title"));
    t.textContent = text;
  }

  function render(countries) {
    var group = svg.querySelector("g.cities") || svg.appendChild(document.createElementNS(NS, "g"));
    var matched = 0, cities = 0;
    countries.forEach(function (c) {
      var years = (c.years || []).join(", ");
      var paths = svg.querySelectorAll('path[data-code="' + c.code + '"]');
      if (!paths.length) console.warn("travel: country code " + c.code + " is not on the map");
      else matched++;
      paths.forEach(function (p) {
        p.classList.add("visited");
        p.setAttribute("tabindex", "0");
        p.setAttribute("data-years", years);
        p.setAttribute("data-note", c.note || "");
        setTitle(p, label(p.getAttribute("data-name"), years, c.note));
      });
      (c.cities || []).forEach(function (city) {
        var xy = equalEarth(city.lon, city.lat);
        var cyears = (city.years || []).join(", ");
        var dot = document.createElementNS(NS, "circle");
        dot.setAttribute("class", "city");
        dot.setAttribute("cx", xy[0]);
        dot.setAttribute("cy", xy[1]);
        dot.setAttribute("r", "2");
        dot.setAttribute("tabindex", "0");
        dot.setAttribute("data-name", city.name);
        dot.setAttribute("data-years", cyears);
        dot.setAttribute("data-note", city.note || "");
        setTitle(dot, label(city.name, cyears, city.note));
        group.appendChild(dot);
        cities++;
      });
    });
    if (count) {
      count.textContent =
        matched + (matched === 1 ? " country" : " countries") + " · " + cities + (cities === 1 ? " city" : " cities");
    }
    if (window.worldMapRefresh) window.worldMapRefresh(); // size the new dots for the current zoom
  }

  window
    .siteFetch("/travel")
    .then(render)
    .catch(function (e) {
      console.error(e);
      if (count) count.textContent = "Travel data is temporarily unavailable.";
    });
})();
