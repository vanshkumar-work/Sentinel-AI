document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const btn = document.getElementById("analyzeBtn");
  const btnText = document.getElementById("btnText");
  const loader = document.getElementById("loader");
  const resultDiv = document.getElementById("result");

  // UI State: Loading
  btn.disabled = true;
  loader.style.display = "inline-block";
  btnText.innerText = "Analyzing...";
  resultDiv.innerText = "Scanning page content...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Better extraction: only get relevant text tags
    const injected = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const bodyText = document.body.innerText;
        return bodyText.replace(/\s+/g, ' ').trim().slice(0, 4500);
      },
    });

    const pageText = injected[0].result;

    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: pageText }),
    });

    const data = await response.json();

    if (data.success) {
      resultDiv.innerHTML = formatAIResponse(data.result);
    } else {
      throw new Error(data.error);
    }

  } catch (error) {
    console.error(error);
    resultDiv.innerHTML = `<span style="color:#ef4444">⚠️ Error: Backend not reachable. Make sure server.js is running.</span>`;
  } finally {
    btn.disabled = false;
    loader.style.display = "none";
    btnText.innerText = "Re-Analyze";
  }
});

// Simple helper to make the AI output look cleaner
function formatAIResponse(text) {
  return text
    .replace("SUMMARY:", "<strong style='color:#3b82f6'>📋 SUMMARY</strong>")
    .replace("RISKS:", "<br><strong style='color:#ef4444'>🚨 RISKS</strong>")
    .replace("TRUST_SCORE:", "<br><strong style='color:#10b981'>⭐ TRUST SCORE</strong>");
}