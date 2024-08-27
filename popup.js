console.log("--> popup <--");
const synhix_theme = "synhix_theme";
let _contentTabId = -1;
const _defaultTheme = "Liberal.Gray1.Medium";

chrome.runtime.connect({ name: "popup" });
chrome.identity.getProfileUserInfo({ 'accountStatus': 'ANY' }, onIdentity);
chrome.storage.sync.get(synhix_theme).then((result) => {
    console.log("<- popup console.log get synhix_theme ->  [" + result.synhix_theme + "]");
    let theme = result.synhix_theme;
    if (theme === undefined || theme == null || theme == "") theme = _defaultTheme;
    set_theme(theme);
});
function set_theme(theme) {
    const selections = theme.split('.');

    if (selections.length == 3) {
        const s1 = document.getElementById('theme');
        const s2 = document.getElementById('color');
        const s3 = document.getElementById('sharpness');

        s1.value = selections[0];
        s2.value = selections[1];
        s3.value = selections[2];
    }
}
document.addEventListener('DOMContentLoaded', (event) => {
    console.log("-> DOMContentLoaded, adding event listener for onchange on");
    document.getElementById('update').addEventListener('click', colorThemeChange);
    document.getElementById('uncolor').addEventListener('click', uncolor);
    document.getElementById('default').addEventListener('click', setDefault);

    // initialize
    chrome.storage.sync.get("synhix_active").then((result) => {
        if (result !== undefined)
            if (!result.synhix_active) {
                document.getElementById('activate').checked = false;
                show_active(false);
            }
    });
    document.getElementById('activate').addEventListener('change', activate);
});

function activate_ORIG() {
    chrome.storage.sync.get("synhix_active").then((result) => {
        let enable = true;
        if (result !== undefined) enable = !result.synhix_active;
        
        show_active(enable);
        chrome.storage.sync.set({ "synhix_active": enable }).then(() => {
            reloadTab();
        });       
    });
}
function activate() {
    // Change cursor to 'wait'
    document.body.style.cursor = 'wait';

    chrome.storage.sync.get("synhix_active", (result) => {
        let enable = true;
        if (result !== undefined) enable = !result.synhix_active;

        show_active(enable);

        chrome.storage.sync.set({ "synhix_active": enable }, () => {
            reloadTab(); // Directly call reloadTab here
            document.body.style.cursor = 'default'; // Revert cursor back to default
        });
    });

    // Optional: Handle errors if chrome.storage.sync.get fails
    // (if the API you are using supports this)
}

function show_active(enable) {
    let lbl = document.getElementById('active_text');
    lbl.textContent = enable ? "Active" : "Disabled";
    lbl.style.color = enable ? "black" : "red";
    document.getElementById('uncolor').disabled = !enable;
}

chrome.storage.sync.get("synhix_contentTabId").then((result) => {
    _contentTabId = result.synhix_contentTabId;
    chrome.storage.sync.set({ "synhix_contentTabId": -1 }).then(() => {});
});

function colorThemeChange() {
    const s1 = document.getElementById('theme');
    const s2 = document.getElementById('color');
    const s3 = document.getElementById('sharpness');

    let selectedTheme = s1.value + '.' + s2.value + '.' + s3.value;
    set_theme_activate(selectedTheme);
}

function setDefault () {
    set_theme_activate(_defaultTheme);
}
function set_theme_activate(theme) {
    chrome.storage.sync.set({ synhix_theme: theme }).then(() => {
        set_theme(theme);
        let activateBtn = document.getElementById('activate');
        if (!activateBtn.checked) {
            chrome.storage.sync.set({ "synhix_active": true }).then(() => {
                activateBtn.checked = true;
                show_active(true);
                reloadTab();
            });
        }
        else
            reloadTab();
    });
}

function onIdentity(info) {
/*    if (paid(info)) {
        document.getElementById('paybutton').innerHTML = "Paid, Thank you";
        document.getElementById('paymessage').innerHTML = "email[" + info.email + "] id[" + info.id+ "]";
    }
    checkIsPinned();
*/
}
/*
function paid(info) {//TODO
    return false;
}
*/
async function checkIsPinned() {
    let userSettings = await chrome.action.getUserSettings();
    if (!userSettings.isOnToolbar)
        document.getElementById('pinmessage').innerHTML = "Please pin Synhix";
}
function uncolor()
{
    chrome.storage.sync.set({ "synhix_uncolor" : true }).then(() => {
        console.log("-> popup console.log set synhix_uncolor to true");
        reloadTab();
    });
}
function reloadTab() {
    console.log("-> popup: _contentTabId = " + _contentTabId);
    if (_contentTabId == -1) chrome.tabs.reload();
    else chrome.tabs.reload(_contentTabId);
}

