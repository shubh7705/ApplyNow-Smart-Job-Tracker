import { saveJob, getJobs, upsertJob, updateJob, deleteJob, clearJobs } from "../storage/store.js";
import { summarizeJD } from "../ai/summerizer.js";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "JOB_DETECTED") {
      const job = msg.payload;
      const summary = await summarizeJD(job.description || "");
      const saved = await upsertJob({
        ...job,
        summary: summary.summary,
        keywords: summary.keywords,
        status: job.status || "Detected"
      });
      sendResponse({ ok: true, job: saved });
      return;
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
      const jobs = await getJobs();
      sendResponse({ ok: true, jobs });
      return;
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
