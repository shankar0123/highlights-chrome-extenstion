import { dotnet } from './dotnet.js'

const _runFromVS = false;

const { setModuleImports, getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    .withApplicationArgumentsFromQuery()
    .create();

setModuleImports('main.js', {
    window: {
        location: {
            href: () => globalThis.window.location.href
        }
    }
});

const config = getConfig();
export const exports = await getAssemblyExports(config.mainAssemblyName);

const synhix = exports.Synhi_interop;

const text = synhix.Greeting();
console.log("->" + text);
document.getElementById('out').innerHTML = text;

console.log("-> InitializeAsync start ...");
await synhix.InitializeAsync();
console.log("-> InitializeAsync end.");

if (_runFromVS) {
    console.log("-> document.getElementById('update').addEventListener('click', colorThemeChange)");
    document.getElementById('update').addEventListener('click', colorThemeChange);
}
colorThemeChange();
console.log(">>> main v3 <<<")

await dotnet.run();

// --- Command Relay by Ash
// Listener for calls from the offscreen relay
window.addEventListener('message', onMessage);
async function onMessage (event) { // Listen to offscreen
    let result = "no result -------------------------------------------";
    if (event.data === null) console.log("XXX---> event.data === null");
    else if (event.data.command === null) console.log("XXX---> event.data.command === null");

    if (event.data == null || event.data.command == null) return;

    let pn_;
    switch (event.data.command) {
        case 'SYC': // Synhix Colorize
            pn_ = event.data.pn;
            //result = synhix.Colorize("Ashraf Azmi wrote this.", event.data.isDark);            
            result = synhix.Colorize(event.data.nhtml, event.data.isDark);            
            event.source.postMessage( {pn: pn_, color_nhtml: result} , event.origin); // reply to offscreen
            break;

        case 'SYG': // Synhix Get CSS
            pn_ = event.data.pn;
            result = await synhix.GetCSSAsync(event.data.colorTheme);
            if (result == "") break;
            event.source.postMessage({ pn:pn_, css:result }, event.origin); // reply to offscreen
            break;
    }
}

async function colorThemeChange() {
    const s1 = document.getElementById('theme');
    const s2 = document.getElementById('color');
    const s3 = document.getElementById('sharpness');

    let startTime = new Date();

    const theme = s1.value + '.' + s2.value + '.' + s3.value;
    const css_ = await synhix.GetCSSAsync(theme);
    if (css_ == null || css_ == "") return;

    let endTime = new Date();
    let timeDifference = (endTime - startTime) / 1000
    document.getElementById('CSSText').innerHTML = timeDifference;
    updateStyle(css_);

    // ---------------------
    if (_runFromVS) runIndexHTMLTest();
}
function updateStyle(css) {
    // ------------------------------
    // repeated in content and main
    // ------------------------------
    const synhixStyle = "synhix_style"
    let style = document.getElementById(synhixStyle);
    if (!style) {
        style = document.createElement('style');
        style.id = synhixStyle;
        document.head.appendChild(style);
    }
    style.innerHTML = css;
}
// ---
function runIndexHTMLTest() {
    console.log("-> update 2");
    const p1 = document.getElementById('p1'); p1.innerHTML = synhix.Colorize(p1.innerHTML);
    const p2 = document.getElementById('p2'); p2.innerHTML = synhix.Colorize(p2.innerHTML);

    const p1d = document.getElementById('p1d'); p1d.innerHTML = synhix.Colorize(p1d.innerHTML, true);
    const p2d = document.getElementById('p2d'); p2d.innerHTML = synhix.Colorize(p2d.innerHTML, true);
}

