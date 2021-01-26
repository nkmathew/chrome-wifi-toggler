// Background script

var port = null;
var HOST = 'net.nkmathew.chromewifitoggler';
var WAIT = '…';

function nativeConnection() {
  port = chrome.runtime.connectNative(HOST);
  console.log('Attempting connection with native host...');
  port.onMessage.addListener(async (status) => {
    let text = await getBadgeText();
    console.log('Received: ', status, text);
    if (text == WAIT && !status.startsWith('+')) {
      return;
    }
    if (status == 'offline') {
      chrome.browserAction.setBadgeBackgroundColor({ color: '#DD1616' });
      chrome.browserAction.setBadgeText({ text: 'OFF' });
    } else {
      chrome.browserAction.setBadgeText({ text: '' });
      let tab = await getTab();
      if (tab.url.includes(`//${tab.title}/`)) {
        setTimeout(() => {
          chrome.tabs.reload(tab.id);
        }, 7e3);
      }
    }
  });
  port.onDisconnect.addListener(() => {
    console.log('Disconnected...');
  });
}

chrome.browserAction.onClicked.addListener((tab) => {
  chrome.browserAction.setBadgeBackgroundColor({ color: '#717171' });
  chrome.browserAction.setBadgeText({ text: WAIT });
  port.postMessage('toggle-wifi');
});

nativeConnection();

/**
 * Detect and reload tabs whose loading was interrupted by the network change
 */
chrome.tabs.onActivated.addListener(async (tab) => {
  tab = await getTab(tab.tabId);
  if (!tab.url.includes(`//${tab.title}/`)) {
    return;
  }
  chrome.tabs.executeScript(tab.id, { code: '' }, (res) => {
    if (chrome.runtime.lastError) {
      chrome.tabs.reload(tab.id);
    }
  });
});
