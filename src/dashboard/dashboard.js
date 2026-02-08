import { JOB_STATUSES } from "../utils/constants.js";
import { formatDate, truncate, toSentenceCase } from "../utils/helpers.js";

const listEl = document.getElementById("jobList");
const detailsEl = document.getElementById("jobDetails");
const statsEl = document.getElementById("stats");
const searchEl = document.getElementById("search");
const statusFilterEl = document.getElementById("statusFilter");
const sortByEl = document.getElementById("sortBy");
const addJobBtn = document.getElementById("addJob");
const clearBtn = document.getElementById("clearAll");
const dialog = document.getElementById("jobDialog");
const jobForm = document.getElementById("jobForm");

let jobs = [];
let selectedId = null;

JOB_STATUSES.forEach((status) => {
  const option = document.createElement("option");
  option.value = status;
  option.textContent = status;
  statusFilterEl.appendChild(option);
});

function sendMessage(type, payload) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, payload }, (response) => resolve(response));
  });
}

async function loadJobs() {
  const response = await sendMessage("GET_JOBS");
  jobs = response?.jobs || [];
  render();
}

function render() {
  renderStats();
  renderList();
  renderDetails();
}

function renderStats() {
  const total = jobs.length;
  const applied = jobs.filter((job) => job.status === "Applied").length;
  const interviews = jobs.filter((job) => job.status === "Interview").length;
  const offers = jobs.filter((job) => job.status === "Offer").length;

  statsEl.innerHTML = "";
  const cards = [
    { label: "Total", value: total },
    { label: "Applied", value: applied },
    { label: "Interviews", value: interviews },
    { label: "Offers", value: offers }
  ];

  cards.forEach((card) => {
    const div = document.createElement("div");
    div.className = "stat-card";
    div.innerHTML = `<h3>${card.label}</h3><p>${card.value}</p>`;
    statsEl.appendChild(div);
  });
}

function getFilteredJobs() {
  const query = searchEl.value.toLowerCase().trim();
  const statusFilter = statusFilterEl.value;

  let filtered = [...jobs];

  if (statusFilter) {
    filtered = filtered.filter((job) => job.status === statusFilter);
  }

  if (query) {
    filtered = filtered.filter((job) =>
      [job.company, job.role, job.notes].some((value) =>
        value?.toLowerCase().includes(query)
      )
    );
  }

  const sortBy = sortByEl.value;
  if (sortBy === "deadline") {
    filtered.sort((a, b) => {
      const aDate = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      const bDate = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return aDate - bDate;
    });
  } else if (sortBy === "company") {
    filtered.sort((a, b) => (a.company || "").localeCompare(b.company || ""));
  } else {
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  return filtered;
}

function renderList() {
  listEl.innerHTML = "";
  const filtered = getFilteredJobs();

  if (!filtered.length) {
    listEl.innerHTML = `<div class="job-card">No jobs yet.</div>`;
    return;
  }

  filtered.forEach((job) => {
    const status = job.status || "Detected";
    const card = document.createElement("div");
    card.className = `job-card${job.id === selectedId ? " active" : ""}`;
    card.innerHTML = `
      <div class="job-meta">
        <span>${formatDate(job.deadline)}</span>
        <span>${status}</span>
      </div>
      <div class="job-title">${job.role || "Role"}</div>
      <div class="job-company">${job.company || "Company"}</div>
      <div class="job-meta">${truncate(job.summary || job.description || "", 120)}</div>
      <span class="badge ${status}">${status}</span>
    `;
    card.addEventListener("click", () => {
      selectedId = job.id;
      render();
    });
    listEl.appendChild(card);
  });
}

function renderDetails() {
  const job = jobs.find((item) => item.id === selectedId);

  if (!job) {
    detailsEl.innerHTML = `
      <div class="details-empty">
        <h3>Select a job</h3>
        <p>Choose an item to view details, update status, or add notes.</p>
      </div>
    `;
    return;
  }

  const currentStatus = job.status || "Detected";

  detailsEl.innerHTML = `
    <h3>${job.role || "Role"}</h3>
    <p class="job-company">${job.company || "Company"}</p>
    <form id="detailsForm">
      <div class="inline">
        <label>
          Status
          <select id="detailStatus">
            ${JOB_STATUSES.map((status) => `<option value="${status}" ${status === currentStatus ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label>
          Deadline
          <input type="date" id="detailDeadline" value="${job.deadline || ""}">
        </label>
      </div>
      <label>
        Notes
        <textarea id="detailNotes" placeholder="Add progress, contacts, or interview notes">${job.notes || ""}</textarea>
      </label>
      <label>
        Summary
        <textarea id="detailSummary" readonly>${job.summary || job.description || ""}</textarea>
      </label>
      <div class="inline">
        <label>
          Source
          <input type="text" id="detailSource" value="${toSentenceCase(job.source || "")}" readonly>
        </label>
        <label>
          Created
          <input type="text" value="${new Date(job.createdAt).toLocaleDateString()}" readonly>
        </label>
      </div>
      <div class="actions">
        <button type="button" id="updateJob" class="primary">Update</button>
        <button type="button" id="deleteJob" class="ghost">Delete</button>
      </div>
      ${job.url ? `<a href="${job.url}" target="_blank" rel="noreferrer">Open job posting</a>` : ""}
    </form>
  `;

  detailsEl.querySelector("#updateJob")?.addEventListener("click", async () => {
    const updates = {
      status: detailsEl.querySelector("#detailStatus")?.value,
      deadline: detailsEl.querySelector("#detailDeadline")?.value || "",
      notes: detailsEl.querySelector("#detailNotes")?.value || ""
    };

    const response = await sendMessage("JOB_UPDATE", { id: job.id, updates });
    if (response?.job) {
      jobs = jobs.map((item) => (item.id === job.id ? response.job : item));
      render();
    }
  });

  detailsEl.querySelector("#deleteJob")?.addEventListener("click", async () => {
    const response = await sendMessage("JOB_DELETE", { id: job.id });
    if (response?.removed) {
      jobs = jobs.filter((item) => item.id !== job.id);
      selectedId = null;
      render();
    }
  });
}

addJobBtn.addEventListener("click", () => {
  jobForm.reset();
  dialog.showModal();
});

clearBtn.addEventListener("click", async () => {
  await sendMessage("CLEAR_JOBS");
  jobs = [];
  selectedId = null;
  render();
});

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const job = {
    company: document.getElementById("company").value,
    role: document.getElementById("role").value,
    deadline: document.getElementById("deadline").value,
    url: document.getElementById("url").value,
    status: "Interested",
    source: "manual"
  };

  const response = await sendMessage("JOB_SAVE", job);
  if (response?.job) {
    jobs.unshift(response.job);
    selectedId = response.job.id;
    render();
  }
  dialog.close();
});

searchEl.addEventListener("input", renderList);
statusFilterEl.addEventListener("change", renderList);
sortByEl.addEventListener("change", renderList);

loadJobs();
