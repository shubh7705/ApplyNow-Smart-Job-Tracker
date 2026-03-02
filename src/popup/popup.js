function sendMessage(type, payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => resolve(response));
  });
}



document.addEventListener("DOMContentLoaded", () => {
  // ✅ All element references inside DOMContentLoaded
  const form = document.getElementById("jobForm");
  const list = document.getElementById("jobList");
  const openDashboard = document.getElementById("openDashboard");

  // Load jobs on open
  loadJobs();

  // Add job
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const job = {
      company: document.getElementById("company").value,
      role: document.getElementById("role").value,
      deadline: document.getElementById("deadline").value,
      status: "Interested",
      source: "manual"
    };

    await sendMessage("JOB_SAVE", job);
    form.reset();
    loadJobs();
  });

  openDashboard.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD" });
  });

  // ✅ Single merged extractBtn listener (you had two)
  document.getElementById("extractBtn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/inject.js"]
    });

    chrome.runtime.sendMessage({ type: "EXTRACT_JOB" });
    document.getElementById("status").innerText = "Extracting...";
  });

  async function loadJobs() {
    list.innerHTML = "";

    const response = await sendMessage("GET_JOBS");
    const jobs = response?.jobs || [];

    if (jobs.length === 0) {
      list.innerHTML = "<li>No jobs saved yet.</li>";
      return;
    }

    jobs.slice(0, 5).forEach((job) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${job.company || "Company"}</strong> - ${job.role || "Role"}
        <span>${job.status || "Detected"} · ${job.deadline || "No deadline"}</span>
      `;
      list.appendChild(li);
    });

  chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "JOBS_UPDATED") {
    loadJobs();
  }
});
  }
});