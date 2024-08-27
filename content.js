let startTime = new Date();
let _bodyIsDark = false;
const _RRM = new Map(); //-----------
let _progressBarInterval;
let _progressContainer; 
let _last_eid = 1;
let _dl = false; //----------------
let _lc; //-------------
const _ACE = new Map(); //---------------------
//-----------------------------
const c_riv = true //----------------------------
//----------------------
//-----
function Synhix_ONP() { //-----------------
    chrome.storage.sync.get("synhix_active").then((result) => {
        if (result.synhix_active === undefined) {
            //-----------------------------------------------------
            chrome.storage.sync.set({ "synhix_active": true }).then(() => {
                //---------------------------------------------------------------------
                Synhix_A();
            });
        }
        else if (result.synhix_active) {
            //----------------------------------------------------------------
            Synhix_A();
        }
    });
}
function Synhix_A() { //----------------
    if (typeof document.hidden !== "undefined") {
        //-----------------------------------
        document.addEventListener("visibilitychange", HVC);
    } else {
        console.log("The Page Visibility API is not supported in this browser.");
    }
    //---------------------------------
    let enableColoring = true;
    let wl = window.location;
    let website = wl.hostname;
    if (website == "www.quora.com" || website == "www.reddit.com")
        _dl = true;

    chrome.storage.sync.get("synhix_uncolor").then((result) => {
        if (result !== undefined) {
            const uncolor = result.synhix_uncolor;
            //---------------------------------------
            if (uncolor !== undefined && uncolor) {
                enableColoring = false;
            }
        }
        //------------------------------------------
        //-----------------------------------------------------

        if (!enableColoring) {
            chrome.storage.sync.set({ "synhix_uncolor": false }).then(() => {
                //--------------------------------
            });
        }
        else {
            let curColorTheme = "liberal.Gray1.medium";
            chrome.storage.sync.get("synhix_theme").then((result) => {
                if (result !== undefined) {
                    const theme = result.synhix_theme;
                    if (theme !== undefined) {
                        curColorTheme = theme;
                        console.log("-> curColorTheme = " + curColorTheme);
                    }
                }
                else
                    console.log("-> ERROR -> result " + result);

                startTime = new Date();
                let version = chrome.runtime.getManifest().version;
                chrome.storage.local.get(['ue', 'uid'], function (result) {
                    if (result.ue && result.uid) {
                        let text = "np," + result.ue + "," + curColorTheme + ","+ version;
                      //------------------------------------------------------------------------------
                        //-------------------------
                        ServerLog(text)
                        //-------------------------------------------------------
                    } else {
                        console.log('No user info found in local storage.');
                    }
                });

                console.log("-> SY (" + curColorTheme + ") " + chrome.runtime.getManifest().version);
                progressBar_start(40);
                chrome.runtime.sendMessage({ command: 'SYG', colorTheme: curColorTheme, pn: -1 }, Synhix_GCR);
            });
        }
    });
}
function HVC() {   //-----------------------
    if (_dl) {
        if (document.hidden) {
            //---------------------------------
            clearInterval(_lc);           
        } else {
            _lc = setInterval(CWC, 500);
            //---------------------------------
        }
    }

    if (c_riv) {
        if (document.hidden)
            R1(true);
        else
            C1();
    }
}
let _lastHeight = document.body.scrollHeight;

let _need2color = false;
let _cycles = 0;
function CWC() { //--------------------
    //------------------------------
    let currentHeight = document.body.scrollHeight; //-------

    if (currentHeight > _lastHeight) {
        //----------------------------------------------------
        _lastHeight = currentHeight;
        _need2color = true;
    }

    if (_need2color) {
        _cycles++;
        if (_cycles > 7) { //------
            _need2color = false;
            _cycles = 0;
        }
    }

    if (_need2color)  //------------
        _need2color = C1();

    //---------------------------------
}
function ServerLog(message) {
    try {
        //---------------
        const url = `https://www.datumtron.com/home/SynhixLog?text=${encodeURIComponent(message)}`;
        fetch(url, {
            method: 'POST', //----------------------------------------
            mode: 'no-cors', //---------------------------------------
            //--------------------------------
        });
        //---------------------------------------------------------------
    } catch (error) {
        //--------------------------------------------------------------------------
    }
}

/*-
---------------------------------
-------------------------------------------------------------
----------------------------------------------
-
---------------------------------------------------------------------------------------------
---------------------------------
------------------------
----------------
-*/
function Synhix_GCR(result) { //-----------------------
    let endTime = new Date();
    let timeDifference = (endTime - startTime) / 1000
    const css_ = result.css;
    //--------------------------------------
    console.log("-> " + timeDifference + " seconds, document titled [" + document.title + "]");
    updateStyle(css_);
    _bodyIsDark = isNodeDark(document.body, false);
    C1();
    window.addEventListener('scroll', debouncedC1);
    window.addEventListener('resize', debouncedC1);
    HVC();
    progressBar_end();
}

function updateStyle(css) {
    //-------------------------------
    //-----------------------------
    //-------------------------------
    const synhixStyle = "synhix_style"
    let style = document.getElementById(synhixStyle);
    if (!style) {
        style = document.createElement('style');
        style.id = synhixStyle;
        document.head.appendChild(style);
    }
    style.innerHTML = css;
}
function Synhix_OVE(el, nhtml) { //--------------------------

    let cstyle = window.getComputedStyle(el);
    let backColor = cstyle.backgroundColor;
    let borderColor = cstyle.borderColor;

    const isDark_ = isNodeDark(el, _bodyIsDark); //---

    const eid = _last_eid++;

    _RRM.set(eid, { _node: el, _nhtml: nhtml });
    Synhix_CRQ(nhtml, eid, isDark_);
}
let _rt = true; //-------------
function Synhix_CRQ(nhtml_, eid, isDark_) { //------------------------
    /*-
-----------------------------------------------------
----------------------------------------------------------------------------------------------------------------------------
----------------------------------------------------------------------------------------------------------------
----*/
    try {
        chrome.runtime.sendMessage({ command: 'SYC', nhtml: nhtml_, pn: eid, isDark: isDark_ }, Synhix_CR); //-------
    } catch (error) {
        if (_rt) {
            _rt = false; //------------------------------------------------------
            console.log("<-> Error: ", error.message, " reloading..."); //--------------------------------
            location.reload();
        }
        else
            console.log("<-> Error: ", error.message); //--------------------------------
        //-----------------------------------------------------------------------------------------
        /*-
---------------------------------
----------------------------------------------------------------
--------------------------------------------------------------------------------
-----------------------------------------------------------------
----------------------
-----------------------------------------------------------
--------*/
    }
}
function Synhix_CR(response) { //-------------------------
    if (chrome.runtime.lastError || response === undefined)
        return;

    const eid = response.pn;
    if (_RRM.has(eid)) {
        const color_nhtml_ = response.color_nhtml;
        if (color_nhtml_.length > 0) {
            //--------------------------
            const el = _RRM.get(eid)._node;
            //-------------------------------------------------------------
            el.innerHTML = color_nhtml_; //-----------------------------------
            el.setAttribute("sy_eid", eid);
        }
        else
            console.log("<--> color_nhtml.length = ", color_nhtml_.length);

        _RRM.delete(eid);
        const coloring = _RRM.size > 0;
        
        //-----------------------------------------------
            //------------------------------------------------------------
                //---------------
        
        //------------------------------------------------------------
        //-------------------------------------------------------------------------------------------------------------------------------
    }
    else console.log("<--> node # " + eid + " is not in Map");
}
/*-
---------------------------------------------------
---------------------------------------------------------------------------------------------------------------------------------
-*/
function hasParent(node, parentTagName) {
    while (node) {
        if (node.tagName === parentTagName) 
            return true;
        node = node.parentNode;
    }
    return false;
}
function hasChild(node, childTagName) {
    return node.querySelector(childTagName) !== null;
}
function isNodeDark(node, bodyIsDark) {
    const cssColor = window.getComputedStyle(node).backgroundColor;

    if (!cssColor || !cssColor.startsWith("rgb")) {
        console.log("-> cssColor is bad = " + cssColor);
        return false;
    }

    const start = cssColor.startsWith("rgba") ? 5 : 4;
    let arr = cssColor.substring(start, cssColor.length - 1).split(",");

    let r = parseInt(arr[0]);
    let g = parseInt(arr[1]);
    let b = parseInt(arr[2]);

    if (cssColor.startsWith("rgba")) {
        const a = parseInt(arr[3]);
        if (a < 0.5)
            return bodyIsDark;
    }

    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    //-----------------------------------------------------------------------------------------------
    return luminance < 0.5;
}
//---------------------
function progressBar_start(duration) {
    //------------------------------------------------------------
    _progressContainer = document.createElement('div');
    _progressContainer.id = 'progress-container';

    _progressContainer.style.display = 'flex';
    _progressContainer.style.alignItems = 'center';
    _progressContainer.style.position = 'fixed';
    _progressContainer.style.top = '0';
    _progressContainer.style.left = '0';
    _progressContainer.style.width = '100%';
    _progressContainer.style.height = '16px';
    _progressContainer.style.zIndex = '9999';
    _progressContainer.style.backgroundColor = '#e0ffe0';

    //---------------------------------------------
    //--------------------------------------------------
    //-----------------------------------
    //-----------------------------------------------------------------------------------

    //-------------------------------------------
    const loadingText = document.createElement('span');
    loadingText.textContent = 'Loading Synhix';
    loadingText.style.fontSize = '10px'; //------------------------
    loadingText.style.marginLeft = '5px';
    loadingText.style.color = "black";

    //-------------------------------------------
    //-------------------------------------------
    _progressContainer.appendChild(loadingText);

    //---------------------------------------------------
    document.body.appendChild(_progressContainer);

    //----------------------------------
    const progressBarElement = document.createElement('div');
    progressBarElement.id = 'progress-bar';

    //----------------------------
    progressBarElement.style.width = '0%';
    progressBarElement.style.height = '2px';
    progressBarElement.style.backgroundColor = '#4CAF50';
    progressBarElement.style.marginLeft = '5px';

    //--------------------------------------------------
    _progressContainer.appendChild(progressBarElement);

    //----------------------------------------------
    const increment = 100 / (duration * 1000 / 50); //-------------------------------

    //-----------------------------
    let progress = 0;
    _progressBarInterval = setInterval(() => {
        progress += increment;
        progressBarElement.style.width = progress + '%';
        if (progress >= 100)
            progressBar_end();
    }, 50);
}
function progressBar_end() {
    if (_progressBarInterval) {
        clearInterval(_progressBarInterval);
        _progressBarInterval = null;
        if (_progressContainer && _progressContainer.parentNode) {
            _progressContainer.parentNode.removeChild(_progressContainer);
        }
    }
}
//-----
//
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };

        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};
const debouncedC1 = debounce(C1, 200); //------------------------------------
/*-
----------------------------
-----------------------
----------------
--
*/
function C1() { //---------
    //----------------------------------
    let colored = false;
    const ves = CVE(true); //----------------
    if (ves.size == 0) { /*-----------------------------------------------*/ return colored; }
    //-------------------
    //------------------------------------------------------------------------------------------------------------------------------------

    for (let [el, html] of ves) {
        if (c_riv) _ACE.set(el, html);
        Synhix_OVE(el, html);
        colored = true;
    }
    //--------------------------------------------------------------------------------------------------------------------------------
    //-------------------
    return colored;
}
function CVE(need2color) { //---------------------
    const unitX = 200;
    const unitY = 15; //-----
    let considered = new Set();
    const map = new Map();

    for (let x = 0; x < window.innerWidth; x += unitX) { //----------------------------------
        for (let y = 0; y < window.innerHeight /*--------*/; y += unitY) {
            let el = document.elementFromPoint(x, y);
            if (el && !considered.has(el)) {
                considered.add(el);
                const html = IV(el, need2color);
                if (html != "")
                    map.set(el, html);
            }
        }
    }
    //------------------------------------------------------
    return map;
}
function R1(forceAll) { //--------
    let visibleElements = new Map();

    if (!forceAll) {
        visibleElements = CVE(false);
        if (visibleElements.size == 0) { /*-------------------------------*/ return; }
    }
    //----------------------------------------------------------------------------------------------------------------------------------------
    //----------
    for (let [el, html] of _ACE) {
        if (!visibleElements.has(el)) { //------------
            //-------------------------------------------------------------------------
            el.innerHTML = html;
            el.removeAttribute("sy_eid");
            _ACE.delete(el);
        }
        //----
    }
    //---------------------------------------------------------------------------------------------------------------------------------------
}
/*-
-----------------------------
-------------------------------------------------
-
------------------------------------------------
---------------------------
---------------------------------------------
-----------------------------------------
--------------------------------
-----------------------
--------------
----------
---------------------------------
------
-
-------------------------------
------------------
--
*/
function IV(el, need2color) { //----------
    const tag = el.tagName;
    if (need2color) {
        if (el.hasAttribute("sy_eid")) return "";
        if (tag == "SPAN" && hasSyClass(el)) return "";
    } 
    
    if (
        tag == "P" || tag == "BLOCKQUOTE" || tag == "H4" || tag == "H5" || tag == "H6" ||
        (tag == "SPAN" && !el.hasAttribute("ID")/*----------------------------------*/) || //--------------------------------------------
        ((tag == "LI" || tag == "DT") && !el.hasAttribute("CLASS") && !hasParent(el, "NAV"))
    ) {
        if (!hasParent(el, "A") && !hasChild(el, "BUTTON")) { //-------------------------------------------------------------------------------------------------------------------------------------------
            const text = el.innerText;
            if (text && text.length > 0 && HMST(text, 2)) { //---------
                const nhtml = el.innerHTML;
                if (nhtml && nhtml.length > 20)
                    return nhtml;
            }
        }
    }
    return "";
}
function HMST(str, numSpaces) { //------------------
    str = str.trim();
    let spaceCount = 0;
    for (let i = 0; i < str.length; i++) {
        if (str[i] === ' ') {
            spaceCount++;
            if (spaceCount > numSpaces) {
                return true;
            }
        }
    }
    return false;
}

function hasSyClass(element) {
    if (element.classList.length === 0) return false;

    for (let className of element.classList) 
        if (className.startsWith('sy_')) 
            return true;

    return false;
}
//-------
Synhix_ONP();
