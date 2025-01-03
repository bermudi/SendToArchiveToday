browser.browserAction.onClicked.addListener(async (tab) => {
    // Clean the URL by removing query parameters and hash
    const cleanUrl = (url) => {
      try {
        const urlObj = new URL(url);
        return urlObj.origin + urlObj.pathname;
      } catch (e) {
        console.error('Invalid URL:', e);
        return url;
      }
    };
    
    const currentUrl = cleanUrl(tab.url);
    
    // Create form data
    const formData = new FormData();
    formData.append('url', currentUrl);
    formData.append('submitid', '0tGq3y9zKAEt118Z/kYrz9QzMBGuQG4yAgq1JYTrL1HDg4Nun3ZaCFhGiflGdbIS');
    
    try {
      // Update current tab with the archive.today submission
      browser.tabs.update(tab.id, {
        url: `https://archive.today/?run=1&url=${encodeURIComponent(currentUrl)}`
      });
    } catch (error) {
      console.error('Error submitting to archive.today:', error);
    }
  });
  