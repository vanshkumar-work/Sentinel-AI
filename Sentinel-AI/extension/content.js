function extractPolicyText() {
    const elements = document.querySelectorAll("p, li, h1, h2, h3, h4");

    let text = "";

    elements.forEach(el => {
        text += el.innerText + " ";
    });

    return text;
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (req.action === "GET_TEXT") {
        sendResponse({ text: extractPolicyText() });
    }
});