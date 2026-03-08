// SPDX-License-Identifier: MIT
// Copyright (c) 2026 Split Search Contributors

/* globals ExtensionAPI, Services */
"use strict";

this.splitView = class extends ExtensionAPI {
  getAPI(context) {
    return {
      splitView: {
        async create(tabId1, tabId2) {
          const window = Services.wm.getMostRecentWindow("navigator:browser");
          if (!window || !window.gBrowser) {
            throw new Error("No browser window found");
          }

          const gBrowser = window.gBrowser;

          // Check that split view is enabled
          if (typeof gBrowser.addTabSplitView !== "function") {
            throw new Error(
              "Split view is not available. Enable browser.tabs.splitView.enabled in about:config"
            );
          }

          // Find the native tab objects from extension tab IDs
          const nativeTab1 = context.extension.tabManager.get(tabId1)?.nativeTab;
          const nativeTab2 = context.extension.tabManager.get(tabId2)?.nativeTab;

          if (!nativeTab1 || !nativeTab2) {
            throw new Error("Could not find one or both tabs");
          }

          gBrowser.addTabSplitView([nativeTab1, nativeTab2]);
        },
      },
    };
  }
};
