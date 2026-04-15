document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("analyzeBtn");
  const resultDiv = document.getElementById("result");

  const container = document.createElement("div");

container.innerHTML = `
  <div style="
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #1e293b;
    color: white;
    padding: 12px;
    border-radius: 10px;
    z-index: 9999;
    width: 250px;
    font-family: sans-serif;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  ">
    <button id="scanBtn" style="
      width: 100%;
      padding: 8px;
      background: #3b82f6;
      border: none;
      border-radius: 6px;
      color: white;
      cursor: pointer;
    ">🔍 Scan Privacy</button>
    <div id="output" style="margin-top:10px; font-size:12px;"></div>
  </div>
`;
document.getElementById("scanBtn").onclick = async () => {
  const text = document.body.innerText.slice(0, 4000);

  const res = await fetch("http://localhost:5000/analyze", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ text })
  });

  const data = await res.json();

  document.getElementById("output").innerText = data.result;
};

document.body.appendChild(container);
  btn.addEventListener("click", async () => {
    resultDiv.innerText = "Analyzing...";

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const injected = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText.slice(0, 4000),
      });

      const pageText = injected[0].result;

      const response = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: pageText }),
      });

      const data = await response.json();

      resultDiv.innerText = data.result;

    } catch (error) {
      console.error(error);
      resultDiv.innerText = "Backend not working";
    }
  });
});