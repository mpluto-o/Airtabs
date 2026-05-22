document.addEventListener("DOMContentLoaded", async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const tabListContainer = document.getElementById("tab-list");
  const sendBtn = document.getElementById("send-btn");
  const selectAllBtn = document.getElementById("select-all-btn");

  // Helper function to update the main button text and Select All state
  const updateButtonText = () => {
    const totalCheckboxes = document.querySelectorAll('#tab-list input[type="checkbox"]').length;
    const selectedCount = document.querySelectorAll('#tab-list input:checked').length;
    
    // 1. Sync the "Select All" checkbox state dynamically
    if (selectedCount === totalCheckboxes && totalCheckboxes > 0) {
      selectAllBtn.checked = true;
    } else {
      selectAllBtn.checked = false;
    }

    // 2. Update the Broadcast button appearance
    if (selectedCount === 0) {
      sendBtn.textContent = "Select Tabs to Broadcast";
      sendBtn.style.backgroundColor = "#ccc"; // Grey out button
      sendBtn.style.cursor = "not-allowed";
    } else {
      sendBtn.textContent = `Broadcast (${selectedCount})`;
      sendBtn.style.backgroundColor = "#007aff"; // Restore blue
      sendBtn.style.cursor = "pointer";
    }
  };

    const historyToggle = document.getElementById("history-toggle");
  const toggleIcon = document.getElementById("toggle-icon");
  const receivedContainer = document.getElementById("received-tabs");

  // The Dropdown Logic
  historyToggle.addEventListener("click", () => {
    if (receivedContainer.style.display === "none") {
      receivedContainer.style.display = "flex"; // Open it
      toggleIcon.textContent = "▲"; // Flip arrow up
    } else {
      receivedContainer.style.display = "none"; // Close it
      toggleIcon.textContent = "▼"; // Flip arrow down
    }
  });
  // Build the DOM elements
  tabs.forEach(tab => {
    const tabRow = document.createElement("label");
    tabRow.style.display = "flex";
    tabRow.style.alignItems = "center";
    tabRow.style.marginBottom = "8px";
    tabRow.style.cursor = "pointer"; 

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = tab.url; 
    checkbox.dataset.title = tab.title; 
    checkbox.checked = true; 
    
    // Listen for changes on individual checkboxes
    checkbox.addEventListener('change', updateButtonText);

    const labelText = document.createElement("span");
    labelText.textContent = tab.title;
    labelText.style.marginLeft = "8px";
    labelText.style.fontSize = "13px";
    labelText.style.whiteSpace = "nowrap";
    labelText.style.overflow = "hidden";
    labelText.style.textOverflow = "ellipsis";

    tabRow.appendChild(checkbox);
    tabRow.appendChild(labelText);
    tabListContainer.appendChild(tabRow);
  });

  // Run once on load to set the initial button state
  updateButtonText();

  // Handle the "Select All" toggle
  selectAllBtn.addEventListener('change', (e) => {
    const allCheckboxes = document.querySelectorAll('#tab-list input[type="checkbox"]');
    allCheckboxes.forEach(cb => {
      cb.checked = e.target.checked; 
    });
    updateButtonText(); 
  });

  // Handle the Send Broadcast click
  sendBtn.addEventListener("click", () => {
    const selectedCheckboxes = document.querySelectorAll('#tab-list input:checked');
    if (selectedCheckboxes.length === 0) return; 

    const tabsToSend = Array.from(selectedCheckboxes).map(cb => ({
      title: cb.dataset.title,
      url: cb.value
    }));

    const payload = {
      tabs: tabsToSend,
      timestamp: Date.now(),
      sender: "Pluto's Mac"
    };

    chrome.runtime.sendMessage({ type: "SEND_TABS", payload: payload });
    
    // 3. Dynamic grammar for the success message
    const grammar = tabsToSend.length === 1 ? "tab" : "tabs";
    sendBtn.textContent = `Sent ${tabsToSend.length} ${grammar}!`;
    
    setTimeout(updateButtonText, 2000); 
  });


  chrome.runtime.sendMessage({ type: "FETCH_NETWORK_TABS" }, (response) => {
    receivedContainer.innerHTML = ""; // Clear the "Fetching..." text

    if (response && response.data) {
      // Firebase returns an object. We convert it to an array and sort by newest first.
      const batches = Object.values(response.data).sort((a, b) => b.timestamp - a.timestamp);

      batches.forEach(batch => {
        // Create a mini-card for each received batch
        const batchCard = document.createElement("div");
        batchCard.style.borderBottom = "1px solid #eee";
        batchCard.style.paddingBottom = "8px";

        // Display Sender and Time
        const batchDate = new Date(batch.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.fontSize = "12px";
        header.style.color = "#86868b";
        header.style.marginBottom = "4px";
        header.innerHTML = `<strong>${batch.sender}</strong> <span>${batchDate}</span>`;
        batchCard.appendChild(header);

        // List out the tab titles
        batch.tabs.forEach(tab => {
          const tabTitle = document.createElement("p");
          tabTitle.textContent = `• ${tab.title}`;
          tabTitle.style.fontSize = "12px";
          tabTitle.style.margin = "2px 0";
          tabTitle.style.whiteSpace = "nowrap";
          tabTitle.style.overflow = "hidden";
          tabTitle.style.textOverflow = "ellipsis";
          batchCard.appendChild(tabTitle);
        });

        // The Magic Button: Open all tabs in this batch
        const openBtn = document.createElement("button");
        openBtn.textContent = `Open ${batch.tabs.length} Tab(s)`;
        openBtn.style.marginTop = "6px";
        openBtn.style.padding = "4px 8px";
        openBtn.style.fontSize = "11px";
        openBtn.style.cursor = "pointer";
        openBtn.style.borderRadius = "6px";
        openBtn.style.border = "1px solid #007aff";
        openBtn.style.backgroundColor = "transparent";
        openBtn.style.color = "#007aff";
        
        openBtn.addEventListener("click", () => {
          batch.tabs.forEach(tab => {
            chrome.tabs.create({ url: tab.url }); // Native Chrome API to open a new tab
          });
        });

        batchCard.appendChild(openBtn);
        receivedContainer.appendChild(batchCard);
      });
    } else {
      receivedContainer.innerHTML = "<p style='font-size: 13px; color: #86868b; text-align: center;'>No history found.</p>";
    }
  });
});