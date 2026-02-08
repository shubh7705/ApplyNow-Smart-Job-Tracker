import { DEFAULT_STATUS } from "../utils/constants.js";
import { uid } from "../utils/helpers.js";

const STORAGE_KEY = "jobs";

export async function getJobs() {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  return data[STORAGE_KEY] || [];
}

export async function getJob(id) {
  const jobs = await getJobs();
  return jobs.find((job) => job.id === id) || null;
}

export async function saveJob(job) {
  const jobs = await getJobs();
  const next = { ...job };
  if (!next.id) next.id = uid();
  if (!next.status) next.status = DEFAULT_STATUS;
  next.createdAt = next.createdAt || new Date().toISOString();
  next.updatedAt = new Date().toISOString();

  jobs.unshift(next);
  await chrome.storage.local.set({ [STORAGE_KEY]: jobs });
  return next;
}

export async function upsertJob(job) {
  const jobs = await getJobs();
  const index = jobs.findIndex((item) => item.url && job.url && item.url === job.url);

  if (index >= 0) {
    const updated = {
      ...jobs[index],
      ...job,
      id: jobs[index].id,
      updatedAt: new Date().toISOString()
    };
    jobs[index] = updated;
    await chrome.storage.local.set({ [STORAGE_KEY]: jobs });
    return updated;
  }

  return saveJob(job);
}

export async function updateJob(id, updates) {
  const jobs = await getJobs();
  const index = jobs.findIndex((job) => job.id === id);
  if (index === -1) return null;

  const updated = {
    ...jobs[index],
    ...updates,
    id,
    updatedAt: new Date().toISOString()
  };

  jobs[index] = updated;
  await chrome.storage.local.set({ [STORAGE_KEY]: jobs });
  return updated;
}

export async function deleteJob(id) {
  const jobs = await getJobs();
  const filtered = jobs.filter((job) => job.id !== id);
  await chrome.storage.local.set({ [STORAGE_KEY]: filtered });
  return filtered.length !== jobs.length;
}

export async function clearJobs() {
  await chrome.storage.local.set({ [STORAGE_KEY]: [] });
}
