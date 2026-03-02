// --------------------
// Extractors
// --------------------

function linkedinExtractor() {
  const role = document.querySelector("h1")?.innerText?.trim();

  const company = document.querySelector(
    ".job-details-jobs-unified-top-card__company-name a"
  )?.innerText?.trim();

  const description = document.querySelector(
    ".jobs-description__content"
  )?.innerText?.trim();

  return { role, company, description };
}

function indeedExtractor() {
  const role = document.querySelector("h1")?.innerText;
  const company = document.querySelector("[data-testid=inlineHeader-companyName]")?.innerText;
  const description = document.querySelector("#jobDescriptionText")?.innerText;
  return { role, company, description };
}

function genericExtractor() {
  const role = document.querySelector("h1,h2")?.innerText;
  const description = document.body.innerText.slice(0, 3000);
  return { role, company: "Unknown", description };
}

function getExtractor(host) {
  if (host.includes("linkedin")) return linkedinExtractor;
  if (host.includes("indeed")) return indeedExtractor;
  return genericExtractor;
}

// --------------------
// ✅ Wrap in IIFE to prevent re-declaration errors on multiple injects
// --------------------

(function () {
  const extractor = getExtractor(location.hostname);
  const data = extractor();

  if (data?.role) {
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
        if (chrome.runtime.lastError) {
          console.warn("ApplyNow: message error", chrome.runtime.lastError.message);
        }
      }
    );
  } else {
    console.warn("ApplyNow: No job data found on this page.");
  }
})();