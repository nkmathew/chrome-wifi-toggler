/**
 * Credit to AdeelH/find-on-reddit for the inspiration
 *   => https://github.com/AdeelH/find-on-reddit/blob/master/chrome.js
 */

/**
 * Get badge text
 */
function getBadgeText() {
  return new Promise(function (resolve) {
    chrome.browserAction.getBadgeText({}, (text) => resolve(text));
  });
}

/**
 * Get specific tab or default to current tab
 */
function getTab(tabId = null) {
  return new Promise((resolve) => {
    if (tabId) {
      chrome.tabs.get(tabId, resolve);
    } else {
      chrome.tabs.query({ active: true }, ([tab]) => resolve(tab));
    }
  });
}
