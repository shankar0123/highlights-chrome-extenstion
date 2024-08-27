
const _iframe = document.getElementById("synhix_iframe");
const _responseMap = new Map();
window.addEventListener("message", mainResponse); // 3. Listen to main

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { // 1. Listen to content
    if (!request || !request.pn) return false;
    const pn_ = request.pn;
    _responseMap.set(pn_, sendResponse);
    //console.log("-> [" + pn_ + "] off request.pn");
    _iframe.contentWindow.postMessage(request, "*"); // 2. Forward to main
    
    return true;
});
function mainResponse(event) {
    const pn_ = event.data.pn;
    if (!pn_ || !_responseMap.has(pn_)) return;
    //console.log("<- [" + pn_ + "] off event.data.pn");
    _responseMap.get(pn_)(event.data);// 4. Respond to content
    _responseMap.delete(pn_);
}
