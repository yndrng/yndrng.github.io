// Renders the gigs table from the life-app API (newest first, same date format as before).
(function () {
  "use strict";

  var box = document.getElementById("gigs");
  if (!box) return;

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function parse(iso) {
    var p = iso.split("-").map(Number);
    return { y: p[0], m: p[1], d: p[2] };
  }
  function dd(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function full(x) {
    return dd(x.d) + " " + MONTHS[x.m - 1] + " " + x.y;
  }
  function range(startIso, endIso) {
    var s = parse(startIso), e = parse(endIso);
    if (startIso === endIso) return full(s);
    if (s.y === e.y && s.m === e.m) return s.d + "–" + full(e);
    if (s.y === e.y) return dd(s.d) + " " + MONTHS[s.m - 1] + " – " + full(e);
    return full(s) + " – " + full(e);
  }

  function cell(tag, text) {
    var el = document.createElement(tag);
    el.textContent = text;
    return el;
  }

  function render(gigs) {
    box.textContent = "";
    if (!gigs.length) {
      box.appendChild(cell("p", "No gigs logged yet.")).className = "muted";
      return;
    }
    var table = document.createElement("table");
    var head = table.createTHead().insertRow();
    ["Artist", "Date", "Venue", "City", "Country"].forEach(function (h) {
      head.appendChild(cell("th", h));
    });
    var body = table.createTBody();
    gigs.forEach(function (g) {
      var row = body.insertRow();
      [g.artist, range(g.start, g.end), g.venue, g.city, g.country].forEach(function (v) {
        row.appendChild(cell("td", v));
      });
    });
    box.appendChild(table);
  }

  window
    .siteFetch("/gigs")
    .then(render)
    .catch(function (e) {
      console.error(e);
      box.textContent = "Gigs are temporarily unavailable.";
    });
})();
