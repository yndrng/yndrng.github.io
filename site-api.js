// Gigs and travel live in the life-app database; these pages read them from its public API.
window.SITE_API = "https://tglifeapp.duckdns.org/api/public/site";

window.siteFetch = function (path) {
  return fetch(window.SITE_API + path, { headers: { Accept: "application/json" } }).then(function (r) {
    if (!r.ok) throw new Error(path + ": HTTP " + r.status);
    return r.json();
  });
};
