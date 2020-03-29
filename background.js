'use strict';

//
// Extention Events
//
//chrome.runtime.onInstalled.addListener(function() {});

// When a tab is updated check to see if it is loaded and reset the icon UI
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  ifExtensionIsTurnedOn(() => {
    if (changeInfo.status == 'complete' && tab.url.startsWith("http") && tab.active) {
      resetIconUI();
  
      chrome.tabs.executeScript({ file: "content.js" }, result => {
        // Catch errors such as "This page cannot be scripted due to an ExtensionsSettings policy."
        const lastErr = chrome.runtime.lastError;
        if (lastErr) console.log('Error: ' + lastErr.message);
      });
    }  
  });
});

// Fires when the active tab in a window changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  resetIconUI();

  tryToUpdateIconUIFromStorage(activeInfo.tabId.toString());
});

// message from content script, the LCP will be in request.result
chrome.runtime.onMessage.addListener((request, sender, response) => {
  updateIconUI(request.result);

  chrome.storage.local.set({[sender.tab.id]: request.result});
});

// Toggle the extension on and off when you tap on the icon
chrome.browserAction.onClicked.addListener((tab) => {
  chrome.storage.local.get('off', (result) => {
    if (result.off) { // turn it on
      chrome.storage.local.set({ 'off': false });
      chrome.browserAction.setIcon({path: "lcp-on.png"});
      chrome.browserAction.setBadgeText({text: ""});
    
      tryToUpdateIconUIFromStorage(tab.id.toString());
    } else { // turn it off
      chrome.storage.local.set({ 'off': true });
      chrome.browserAction.setIcon({path: "lcp-off.png"});
      chrome.browserAction.setBadgeText({text: ""});
    }
  });
});

//
// Helper Functions
//

// Given a function, only run it if the extension is turned on by the user
function ifExtensionIsTurnedOn(callback) {
  chrome.storage.local.get('off', (result) => {
    if (!result.off) {
      callback();
    }
  });
}

// Given the LCP in ms, return green, yellow, or red depending on the amount
function getColor(lcp) {
  let color = "red";

  // GREEN < 2.5 seconds, YELLOW < 4.0s,  RED > 4s
  if (lcp < 2500) {
    color = "green";
  } else if (lcp < 4000) {
    color = "yellow";
  }

  return color;
}

// const colorAsHex = {
//   green: "#6ee67d",
//   yellow: "#e6aa3c",
//   red: "#dd1b1b",
// }

// Given the lcp as a number in milliseconds, update the Icon UI
function updateIconUI(lcp) {
  let color = getColor(lcp);

  let lcpBadgeText = (lcp > 9999) ? "BAD" : (lcp / 1000).toFixed(1);

  chrome.browserAction.setIcon({path: "lcp-" + color + '.png'});  
  chrome.browserAction.setBadgeText({text: lcpBadgeText});

  // Let's stick with black for now
  chrome.browserAction.setBadgeBackgroundColor({color: "#000000"});
  // chrome.browserAction.setBadgeBackgroundColor({color: colorAsHex[color]});
}

// load up the most recent result for this tab and update the IconUI
function tryToUpdateIconUIFromStorage(tabId) {
  chrome.storage.local.get(tabId, (result) => {
    if (result[tabId]) {
      updateIconUI(result[tabId]);
    }    
  });
}

// Reset the UI to the base ON or OFF icon
function resetIconUI() {
  chrome.storage.local.get('off', (result) => {
    let onoff = (result.off) ? "off" : "on";

    chrome.browserAction.setIcon({path: "lcp-" + onoff + ".png"});
  });
  chrome.browserAction.setBadgeText({text: ""});
}
