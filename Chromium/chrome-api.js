// Promises

function getBadgeText() {
  return new Promise(function (resolve) {
    chrome.browserAction.getBadgeText({}, (text) => resolve(text));
  });
}
