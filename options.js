// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Split Search Contributors

"use strict";

const PRESETS = {
  google: { name: "Google", url: "https://www.google.com/search?q=%s" },
  bing: { name: "Bing", url: "https://www.bing.com/search?q=%s" },
  duckduckgo: { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" },
  yahoo: { name: "Yahoo", url: "https://search.yahoo.com/search?p=%s" },
  baidu: { name: "Baidu", url: "https://www.baidu.com/s?wd=%s" },
  yandex: { name: "Yandex", url: "https://yandex.com/search/?text=%s" },
};

const $ = (id) => document.getElementById(id);

function setupPreset(side) {
  const preset = $(`${side}-preset`);
  const nameInput = $(`${side}-name`);
  const urlInput = $(`${side}-url`);

  preset.addEventListener("change", () => {
    const key = preset.value;
    if (key !== "custom" && PRESETS[key]) {
      nameInput.value = PRESETS[key].name;
      urlInput.value = PRESETS[key].url;
    }
  });
}

async function loadSettings() {
  const result = await browser.storage.local.get("engines");
  const engines = result.engines || {
    left: PRESETS.google,
    right: PRESETS.bing,
  };

  $("left-name").value = engines.left.name;
  $("left-url").value = engines.left.url;
  $("right-name").value = engines.right.name;
  $("right-url").value = engines.right.url;

  // Set preset dropdowns to match
  for (const side of ["left", "right"]) {
    const url = engines[side].url;
    const match = Object.entries(PRESETS).find(([, v]) => v.url === url);
    $(side + "-preset").value = match ? match[0] : "custom";
  }
}

async function saveSettings() {
  const engines = {
    left: {
      name: $("left-name").value.trim(),
      url: $("left-url").value.trim(),
    },
    right: {
      name: $("right-name").value.trim(),
      url: $("right-url").value.trim(),
    },
  };

  if (!engines.left.url.includes("%s") || !engines.right.url.includes("%s")) {
    alert("Both search URLs must contain %s as a placeholder for the query.");
    return;
  }

  await browser.storage.local.set({ engines });

  const status = $("status");
  status.classList.add("show");
  setTimeout(() => status.classList.remove("show"), 2000);
}

document.addEventListener("DOMContentLoaded", () => {
  setupPreset("left");
  setupPreset("right");
  loadSettings();
  $("save").addEventListener("click", saveSettings);
});
