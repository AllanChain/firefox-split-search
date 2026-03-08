# Split Search

A Firefox extension that searches two engines simultaneously and displays results side by side using Firefox's native split view.

![Firefox Nightly](https://img.shields.io/badge/Firefox-Nightly%2FDevEdition-orange)
![Manifest V2](https://img.shields.io/badge/Manifest-V2-blue)

## Features

- **Native split view** — Uses Firefox's built-in split view, not iframes. Both panels are real browser tabs with full functionality.
- **Address bar integration** — Type `@split` in the URL bar, press Tab, then type your query. Works just like a regular search engine.
- **Tab reuse** — Searching again navigates the existing split tabs instead of opening new ones. No tab accumulation.
- **Configurable engines** — Pick from Google, Bing, DuckDuckGo, Yahoo, Baidu, Yandex, or set custom search URLs via the settings page.
- **Defaults** — Google (left) and Bing (right) out of the box.

## Requirements

- **Firefox Nightly or Developer Edition** — This extension uses a WebExtension Experiment API to control split view, which is only available on non-release builds.
- **Firefox 146+** — Split view was introduced in Firefox 146 (enabled by default since Firefox 149).

## Installation

### Temporary (development)

1. Set the following in `about:config`:
   - `extensions.experiments.enabled` → `true`
   - `browser.tabs.splitView.enabled` → `true` (if not already enabled)
2. Go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on** and select `manifest.json`

> Temporary add-ons are removed when Firefox restarts.

### Permanent (unsigned XPI)

Since this extension uses privileged `experiment_apis`, it **cannot** be signed through AMO. Instead:

1. Build the XPI:
   ```bash
   web-ext build --overwrite-dest
   mv web-ext-artifacts/split_search-*.zip web-ext-artifacts/split_search.xpi
   ```
2. Set the following in `about:config`:
   - `xpinstall.signatures.required` → `false`
   - `extensions.experiments.enabled` → `true`
   - `browser.tabs.splitView.enabled` → `true` (if not already enabled)
3. Open `about:addons` → gear icon → **Install Add-on From File** → select the `.xpi`

The extension will persist across restarts.

### Auto-reload (development)

```bash
web-ext run --firefox=nightly
```

This launches Firefox Nightly with the extension loaded and auto-reloads on file changes.

## Usage

1. Click the address bar
2. Type `@split`, then press **Tab** — the bar switches to "Split Search" mode
3. Type your query and press **Enter**
4. Both search engines open side by side in native split view
5. To search again, repeat the same steps — the existing tabs update in place

## Settings

Open the extension's preferences page (right-click the extension in `about:addons` → **Preferences**) to configure:

- Left and right search engines (preset or custom URL)
- Custom URLs must include `%s` as the query placeholder

## Project Structure

```
├── manifest.json                    # Extension manifest with experiment API
├── background.js                    # Search interception and tab management
├── options.html / options.js        # Settings page
├── icons/                           # Extension icons
└── experiment/splitview/
    ├── schema.json                  # Experiment API schema
    └── api.js                       # Privileged code (gBrowser.addTabSplitView)
```

## Limitations

- **Nightly/DevEdition only** — Experiment APIs and disabled signature checks are not available on stable Firefox. This will change if Mozilla ships the public split view WebExtension API ([Bug 2016928](https://bugzilla.mozilla.org/show_bug.cgi?id=2016928)).
- **Cannot be listed on AMO** — The `experiment_apis` manifest key is rejected by AMO's validator.
- **Split view is per-window** — Each browser window can have its own split view; the extension tracks one active split at a time.

## License

MIT
