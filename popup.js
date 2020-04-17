let history = document.getElementById("history");
let clear = document.getElementById("clear");

let getColor = chrome.extension.getBackgroundPage().getColor;
let badgeTextFromScore = chrome.extension.getBackgroundPage()
  .badgeTextFromScore;

chrome.storage.local.get(null, function (items) {
  let scores = "";

  let itemsArray = [];

  for (const result in items) {
    // ignore the "-1" error runs
    if (items[result].score >= 0) itemsArray.push(items[result]);
  }

  let sortedByScore = itemsArray.sort((a, b) => (a.score > b.score ? 1 : -1));

  for (item of sortedByScore) {
    let score = badgeTextFromScore(item.score);
    if (score != "BAD") {
      score += "s";
    }

    scores += `<div class="item">
    <div class="score ${getColor(item.score)}">${score}</div>
    <div class="title"><a href="${item.url}" title="${item.url}">${
      item.title
    }</a></div>
    <div class="domain">${extractHostname(item.url)}</div>
  </div>
`;
  }

  history.innerHTML = scores;
});

// Clear local storage... FOREVER!
clear.addEventListener("click", () => {
  chrome.storage.local.clear();
});

// A simple function to get a hostname from a URL
function extractHostname(url) {
  return new URL(url).hostname;
}
