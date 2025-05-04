document.getElementById("go").addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173/" }); // Replace with your web app link
  });
  