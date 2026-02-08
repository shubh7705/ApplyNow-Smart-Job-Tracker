const form = document.getElementById("jobForm");
const list = document.getElementById("jobList");
const openDashboard = document.getElementById("openDashboard");

function sendMessage(type, payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => resolve(response));
  });
}

// Load jobs on open
document.addEventListener("DOMContentLoaded", loadJobs);

// Add job
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const company = document.getElementById("company").value;
  const role = document.getElementById("role").value;
  const deadline = document.getElementById("deadline").value;

  const job = {
    company,
    role,
    deadline,
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

// Display jobs
async function loadJobs() {
  list.innerHTML = "";

  const response = await sendMessage("GET_JOBS");
  const jobs = response?.jobs || [];

  jobs.slice(0, 5).forEach((job) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${job.company || "Company"}</strong> - ${job.role || "Role"}
      <span>${job.status || "Detected"} · ${job.deadline || "No deadline"}</span>
    `;
    list.appendChild(li);
  });
}
