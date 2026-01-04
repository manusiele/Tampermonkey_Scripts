// ==UserScript==
// @name         Android Auto Claim + Smart Scroll + Reconnect
// @namespace    clean.autoclaim.android
// @version      2.1
// @description  Mobile-optimized auto-claim script for Android browsers
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    console.log("🔥 Android Auto-Claim Script Loaded");

    /************************************************************
     * CONFIG
     ************************************************************/
    const SETTINGS = {
        clickInterval: 800,       // Slower for mobile stability
        scrollInterval: 1500,
        refreshInterval: 4000,
        claimTexts: ["claim", "collect", "reward"],
        disconnectedTexts: ["disconnected", "offline", "lost connection"]
    };

    /************************************************************
     * UTILITY FUNCTIONS
     ************************************************************/
    function simulateClick(btn) {
        if (!btn) return;
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        btn.dispatchEvent(new TouchEvent("touchstart", { bubbles: true }));
        btn.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
    }

    function isClaimButton(btn) {
        const text = btn.innerText.trim().toLowerCase();
        return SETTINGS.claimTexts.some(t => text.includes(t)) &&
               !text.includes("claimed") &&
               !text.includes("done");
    }

    /************************************************************
     * 1. FIND CLAIM BUTTON (TEXT-BASED)
     ************************************************************/
    function findClaimButton() {
        const buttons = document.querySelectorAll("button, a, div");
        for (const btn of buttons) {
            if (isClaimButton(btn)) {
                return btn;
            }
        }
        return null;
    }

    setInterval(() => {
        const btn = findClaimButton();
        if (btn) {
            console.log("⚡ Claim clicked");
            simulateClick(btn);
        }
    }, SETTINGS.clickInterval);

    /************************************************************
     * 2. SMART AUTO-SCROLL (MOBILE SAFE)
     ************************************************************/
    setInterval(() => {
        const scrollHeight = document.documentElement.scrollHeight;
        const current = window.scrollY + window.innerHeight;

        if (current < scrollHeight - 50) {
            window.scrollBy(0, window.innerHeight / 2);
        }
    }, SETTINGS.scrollInterval);

    /************************************************************
     * 3. AUTO REFRESH IF DISCONNECTED
     ************************************************************/
    setInterval(() => {
        const bodyText = document.body.innerText.toLowerCase();
        if (SETTINGS.disconnectedTexts.some(t => bodyText.includes(t))) {
            console.log("🔄 Connection lost – refreshing");
            location.reload();
        }
    }, SETTINGS.refreshInterval);

    /************************************************************
     * DETECT URL CHANGES
     ************************************************************/
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (state) {
        const result = originalPushState.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return result;
    };

    history.replaceState = function (state) {
        const result = originalReplaceState.apply(this, arguments);
        window.dispatchEvent(new Event('replacestate'));
        window.dispatchEvent(new Event('locationchange'));
        return result;
    };

    window.addEventListener('locationchange', () => {
        console.log("🔄 URL changed – re-running script");
        // Re-run the script logic here if needed
    });

})();
