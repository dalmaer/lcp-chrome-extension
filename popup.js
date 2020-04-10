let history = document.getElementById("history");
let clear = document.getElementById("clear");

let getColor = chrome.extension.getBackgroundPage().getColor;
let badgeTextFromScore = chrome.extension.getBackgroundPage()
  .badgeTextFromScore;

chrome.storage.local.get(null, function (items) {
  let table = "<table><tr><th>Score<br></th><th>Page</th></tr>";

  let itemsArray = [];

  for (const result in items) {
    // ignore the "-1" error runs
    if (items[result].score >= 0) itemsArray.push(items[result]);
  }

  let sortedByScore = itemsArray.sort((a, b) => (a.score > b.score ? 1 : -1));

  for (item of sortedByScore) {
    table += `<tr><td class="score ${getColor(
      item.score
    )}">${badgeTextFromScore(item.score)}</td><td><a href="${
      item.url
    }" title="${item.url}">${item.title}</a></td></tr>`;
  }

  table += "</table>";

  history.innerHTML = table;
});

// Clear local storage... FOREVER!
clear.addEventListener("click", () => {
  chrome.storage.local.clear();
});
