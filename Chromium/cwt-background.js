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
