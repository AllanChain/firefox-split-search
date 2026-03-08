// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Split Search Contributors

"use strict";

const SEARCH_URL_PATTERN = "https://split-search.invalid/?q=*";

const DEFAULT_ENGINES = {
  left: {
    name: "Google",
    url: "https://www.google.com/search?q=%s",
  },
  right: {
    name: "Bing",
    url: "https://www.bing.com/search?q=%s",
  },
};

// Track all active split view pairs: Map<tabId, { leftTabId, rightTabId }>
// Both tab IDs in a pair point to the same split object for fast lookup.
const activeSplits = new Map();

async function getEngines() {
  const result = await browser.storage.local.get("engines");
  return result.engines || DEFAULT_ENGINES;
}

function buildSearchUrl(template, query) {
  return template.replace("%s", encodeURIComponent(query));
}

// Check if a tab still exists
async function tabExists(tabId) {
  if (tabId == null) return false;
  try {
    await browser.tabs.get(tabId);
    return true;
  } catch {
    return false;
  }
}

function trackSplit(leftTabId, rightTabId) {
  const split = { leftTabId, rightTabId };
  activeSplits.set(leftTabId, split);
  activeSplits.set(rightTabId, split);
}

function untrackTab(tabId) {
  const split = activeSplits.get(tabId);
  if (!split) return;
  activeSplits.delete(split.leftTabId);
  activeSplits.delete(split.rightTabId);
}

// Clean up tracking when split view tabs are closed
browser.tabs.onRemoved.addListener((tabId) => {
  untrackTab(tabId);
});

// Intercept navigation to our fake search engine URL
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    const url = new URL(details.url);
    const query = url.searchParams.get("q");
    if (query) {
      performSplitSearch(query, details.tabId);
    }
    // Cancel the navigation to the fake URL
    return { cancel: true };
  },
  { urls: [SEARCH_URL_PATTERN], types: ["main_frame"] },
  ["blocking"]
);

async function performSplitSearch(query, originTabId) {
  const engines = await getEngines();
  const leftUrl = buildSearchUrl(engines.left.url, query);
  const rightUrl = buildSearchUrl(engines.right.url, query);

  const split = activeSplits.get(originTabId);

  if (split) {
    const leftOk = await tabExists(split.leftTabId);
    const rightOk = await tabExists(split.rightTabId);

    if (leftOk && rightOk) {
      // Reuse existing split view tabs — just navigate them
      await browser.tabs.update(split.leftTabId, { url: leftUrl, active: true });
      await browser.tabs.update(split.rightTabId, { url: rightUrl });
      return;
    }
    // Stale split — clean up
    untrackTab(originTabId);
  }

  // Create fresh tabs and split view
  const leftTab = await browser.tabs.create({ url: leftUrl, active: true });
  const rightTab = await browser.tabs.create({ url: rightUrl, active: false });

  trackSplit(leftTab.id, rightTab.id);

  try {
    await browser.splitView.create(leftTab.id, rightTab.id);
  } catch (err) {
    console.error("Split Search: Failed to create split view:", err.message);
  }
}
