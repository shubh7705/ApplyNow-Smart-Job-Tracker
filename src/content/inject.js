// --------------------
// Extractors
// --------------------

function linkedinExtractor() {
  const role = document.querySelector("h1")?.innerText;

  const company = document.querySelector(".topcard__org-name-link")?.innerText;

  const desc = document.querySelector(".description__text")?.innerText;

  return {
    role,
    company,
    description: desc
  };
}

function indeedExtractor() {
  const role = document.querySelector("h1")?.innerText;

  const company = document.querySelector("[data-testid=inlineHeader-companyName]")?.innerText;

  const desc = document.querySelector("#jobDescriptionText")?.innerText;

  return {
    role,
    company,
    description: desc
  };
}

function genericExtractor() {
  const role = document.querySelector("h1,h2")?.innerText;

  const desc = document.body.innerText.slice(0, 3000);

  return {
    role,
    company: "Unknown",
    description: desc
  };
}

// --------------------
// Factory
// --------------------

function getExtractor(host) {
  if (host.includes("linkedin")) {
    return linkedinExtractor;
  }

  if (host.includes("indeed")) {
    return indeedExtractor;
  }

  return genericExtractor;
}

// --------------------
// UI
// --------------------

function createPanel(job) {
  const panel = document.createElement("div");
  panel.id = "applynow-panel";
  panel.innerHTML = `
    <div class="applynow-header">
      <strong>ApplyNow</strong>
      <button class="applynow-close" aria-label="Close">×</button>
    </div>
    <div class="applynow-body">
      <div class="applynow-title">${job.role || "Role"}</div>
      <div class="applynow-sub">${job.company || "Company"}</div>
      <textarea class="applynow-notes" placeholder="Quick note"></textarea>
      <div class="applynow-actions">
        <button class="applynow-save">Mark Interested</button>
        <button class="applynow-open">Open Dashboard</button>
      </div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    #applynow-panel {
      position: fixed;
      right: 16px;
      top: 16px;
      width: 260px;
      background: #0f172a;
      color: #e2e8f0;
      font-family: Arial, sans-serif;
      border-radius: 12px;
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.35);
      z-index: 999999;
      overflow: hidden;
    }
    #applynow-panel .applynow-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: #1e293b;
      font-size: 13px;
    }
    #applynow-panel .applynow-close {
      background: transparent;
      color: #cbd5f5;
      border: none;
      font-size: 16px;
      cursor: pointer;
    }
    #applynow-panel .applynow-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-size: 12px;
    }
    #applynow-panel .applynow-title {
      font-weight: 700;
      font-size: 13px;
      color: #f8fafc;
    }
    #applynow-panel .applynow-sub {
      color: #94a3b8;
    }
    #applynow-panel .applynow-notes {
      min-height: 60px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0b1120;
      color: #e2e8f0;
      padding: 6px;
      resize: vertical;
    }
    #applynow-panel .applynow-actions {
      display: flex;
      gap: 6px;
    }
    #applynow-panel button {
      flex: 1;
      border: none;
      padding: 6px 8px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 11px;
    }
    #applynow-panel .applynow-save {
      background: #38bdf8;
      color: #0f172a;
      font-weight: 600;
    }
    #applynow-panel .applynow-open {
      background: #1e293b;
      color: #e2e8f0;
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(panel);

  panel.querySelector(".applynow-close")?.addEventListener("click", () => {
    panel.remove();
  });

  panel.querySelector(".applynow-open")?.addEventListener("click", () => {
    const url = chrome.runtime.getURL("src/dashboard/dashboard.html");
    chrome.runtime.sendMessage({ type: "OPEN_DASHBOARD", payload: { url } });
  });

  panel.querySelector(".applynow-save")?.addEventListener("click", () => {
    const notes = panel.querySelector(".applynow-notes")?.value || "";
    chrome.runtime.sendMessage({
      type: "JOB_UPDATE",
      payload: {
        id: job.id,
        updates: {
          status: "Interested",
          notes
        }
      }
    });
    panel.remove();
  });
}

// --------------------
// Main Logic
// --------------------

(function detectJob() {
  const extractor = getExtractor(location.hostname);

  if (!extractor) return;

  setTimeout(() => {
    const data = extractor();

    if (!data || !data.role) return;

    chrome.runtime.sendMessage(
      {
        type: "JOB_DETECTED",
        payload: {
          ...data,
          url: location.href,
          source: location.hostname
        }
      },
      (response) => {
        if (response?.job) {
          createPanel(response.job);
        }
      }
    );

    console.log("ApplyNow: Job detected", data);
  }, 2000);
})();
