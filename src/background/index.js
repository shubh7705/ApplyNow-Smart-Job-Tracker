import { saveJob, getJobs, upsertJob, updateJob, deleteJob, clearJobs } from "../storage/store.js";
import { summarizeJD } from "../ai/summerizer.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "EXTRACT_JOB") {

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab.url.includes("linkedin.com") &&
        !tab.url.includes("indeed.com")) {
      console.log("Unsupported site");
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/inject.js"]
    });
  }

   if (msg.type === "JOB_EXTRACTED") {
    console.log("Job data:", msg.data);

    chrome.storage.local.set({
      lastExtractedJob: msg.data
    });
  }

   if (msg.type === "JOB_DETECTED") {
  const job = { ...msg.payload, status: "Detected" };
  saveJob(job).then((saved) => {
    sendResponse({ ok: true, job: saved });

    // ✅ Notify popup to refresh
    chrome.runtime.sendMessage({ type: "JOBS_UPDATED" }).catch(() => {});
  });
  return true;
}

    if (msg.type === "JOB_SAVE") {
      const saved = await saveJob(msg.payload);
      sendResponse({ ok: true, job: saved });
      return;
    }

    if (msg.type === "JOB_UPDATE") {
      const updated = await updateJob(msg.payload.id, msg.payload.updates || {});
      sendResponse({ ok: true, job: updated });
      return;
    }

    if (msg.type === "JOB_DELETE") {
      const removed = await deleteJob(msg.payload.id);
      sendResponse({ ok: true, removed });
      return;
    }

    if (msg.type === "GET_JOBS") {
    getJobs().then((jobs) => {
      sendResponse({ ok: true, jobs });
    });
    return true;
  }

    if (msg.type === "CLEAR_JOBS") {
      await clearJobs();
      sendResponse({ ok: true });
      return;
    }

    if (msg.type === "OPEN_DASHBOARD") {
      const url = msg.payload?.url || chrome.runtime.getURL("src/dashboard/dashboard.html");
      await chrome.tabs.create({ url });
      sendResponse({ ok: true });
      return;
    }
  })();

  return true;
});
