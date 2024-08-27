let _offscreenDocument = null;
let _windowId = -1;

chrome.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        chrome.tabs.create({
            url: "onboarding.html"
        });
        chrome.contextMenus.create({
            id: "synhixMenu",
            title: "Synhix menu",
            contexts: ["all"],
        });
    }
});
function storeUserInfo() {
    chrome.identity.getProfileUserInfo(function (userInfo) {
        if (userInfo.email && userInfo.id) {
            chrome.storage.local.set({ 'ue': userInfo.email, 'uid': userInfo.id }, function () {
                console.log('User email and ID have been stored.');
            });
        } else {
            console.log('No user info available.');
        }
    });
}
function createOffscreenDocument() {
    if (_offscreenDocument === null) {
        chrome.offscreen.createDocument({
            url: "offscreen.html",
            reasons: [chrome.offscreen.Reason.IFRAME_SCRIPTING],
            justification: "Using .net sandbox."
        }, function (createdDocument) {
            if (chrome.runtime.lastError) {
                console.log("->> chrome.runtime.lastError = " + chrome.runtime.lastError);
            } else {
                _offscreenDocument = createdDocument;
                //console.log("->> Offscreen document created successfully.");
            }
        });
    } else {
        console.log("Offscreen document already exists!");
    }
}
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId === "synhixMenu") {
        //console.log("-> synhixMenu");
        // ------------------------------
        // Error in event handler: TypeError: chrome.action.openPopup is not a function at chrome
        // https://github.com/GoogleChrome/developer.chrome.com/issues/2602
        // ------------------------------
        // chrome.action.openPopup();
        // ------------------------------

        // Workaround -- not perfect
        const popupUrl = chrome.runtime.getURL('popup.html');

        chrome.storage.sync.set({ "synhix_contentTabId": tab.id }).then(() => {
            chrome.windows.create({ url: popupUrl, type: 'popup', height: 560, width: 520 }, function (window) { // left, top
                _windowId = window.id;
            });
            chrome.windows.onFocusChanged.addListener(onFocusChangedHandler);
        });       
    }
});
function onFocusChangedHandler(newWindowId) {
    if (newWindowId != _windowId && _windowId != -1) {
        // Close the window if it loses focus
        //console.log("-> closing popup _windowId = " + _windowId)
        chrome.windows.remove(_windowId);
        chrome.windows.onFocusChanged.removeListener(onFocusChangedHandler);
        _windowId = -1;
    }
}
chrome.runtime.onConnect.addListener(function (port) {
    if (port.name === "popup") {
        port.onDisconnect.addListener(function () {
            console.log("--> popup has been closed");
            chrome.windows.onFocusChanged.removeListener(onFocusChangedHandler);
            _windowId = -1;
        });
    }
});
storeUserInfo();
createOffscreenDocument();

