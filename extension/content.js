document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("analyzeBtn");
  const resultDiv = document.getElementById("result");

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