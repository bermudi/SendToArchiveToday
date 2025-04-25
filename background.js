// Archive.ph Saver Extension
browser.browserAction.onClicked.addListener(async (tab) => {
  // Helper to clean the URL
  function cleanUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch (e) {
      console.error('Invalid URL:', e);
      return url;
    }
  }

  const currentUrl = cleanUrl(tab.url);

  // Generate a random submitid - archive.ph seems to accept anything
  function randomSubmitId() {
    // Mimics a random string, you can also use Date.now() if preferred
    return Math.random().toString(36).substring(2, 18);
  }

  const submitId = randomSubmitId();
  const submitUrl = `https://archive.ph/submit/?url=${encodeURIComponent(currentUrl)}&submitid=${encodeURIComponent(submitId)}`;

  try {
    // Try to submit and follow redirect (if any)
    const res = await fetch(submitUrl, { redirect: "manual" });

    // If redirected, get the result location (archive page)
    const location = res.headers.get("Location");
    if (location && (location.startsWith("http") || location.startsWith("/"))) {
      // Absolute or relative URL returned
      let finalUrl = location.startsWith("/") ? `https://archive.ph${location}` : location;
      browser.tabs.update(tab.id, { url: finalUrl });
      return;
    }

    // If not redirected, parse HTML for canonical or meta refresh
    const text = await res.text();
    // Try <link rel="canonical"> first
    const canonicalMatch = text.match(/<link rel="canonical" href="([^"]+)"/i);
    if (canonicalMatch && canonicalMatch[1]) {
      browser.tabs.update(tab.id, { url: canonicalMatch[1] });
      return;
    }
    // Try <meta http-equiv="refresh" content="0;url=...">
    const metaMatch = text.match(/http-equiv=["']refresh["'] content=["'][^;]+;url=([^"']+)["']/i);
    if (metaMatch && metaMatch[1]) {
      let metaUrl = metaMatch[1].startsWith("/") ? `https://archive.ph${metaMatch[1]}` : metaMatch[1];
      browser.tabs.update(tab.id, { url: metaUrl });
      return;
    }

    // Fallback: stay on submit result page
    browser.tabs.update(tab.id, { url: submitUrl });
  } catch (error) {
    console.error('Error submitting to archive.ph:', error);
  }
});