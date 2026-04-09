document.getElementById("scan").addEventListener("click", async () => {

    const resultBox = document.getElementById("result");
    resultBox.textContent = "Reading page...";

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    }, () => {

        chrome.tabs.sendMessage(tab.id, { action: "GET_TEXT" }, async (response) => {

            if (!response || !response.text) {
                resultBox.textContent = "No text found.";
                return;
            }

            resultBox.textContent = "Analyzing with AI...";

            try {
                const res = await fetch("http://localhost:5000/analyze", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text: response.text.slice(0, 8000)
                    })
                });

                const data = await res.json();

                let output = data.response;

                // 🎯 Extract score
                let scoreMatch = output.match(/Score:\s*(\d+)\/10/);

                if (scoreMatch) {
                    let score = parseInt(scoreMatch[1]);

                    let color = "green";
                    if (score >= 7) color = "red";
                    else if (score >= 4) color = "orange";

                    resultBox.innerHTML = `
                        <b>Risk Score:</b> <span style="color:${color}; font-size:18px">${score}/10</span>
                        <hr/>
                        <pre>${output}</pre>
                    `;
                } else {
                    resultBox.textContent = output;
                }

            } catch (err) {
                resultBox.textContent = "Backend not running.";
            }
        });
    });
});