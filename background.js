// 1. Import our locally downloaded Firebase SDK files
import { initializeApp } from './firebase-app.js';
import { getDatabase, ref, push, onChildAdded, get, child } from './firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

// 2. Fire up the connection engines
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 3. Create a target reference pointer to a node named 'broadcasted_tabs' on our cloud whiteboard
const tabsDbRef = ref(db, 'broadcasted_tabs');

// 4. Listen for data coming from our frontend popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_TABS") {
    console.log("Pushing tabs array to cloud database...", message.payload);
    
    // Push the clean data object directly to Firebase
    push(tabsDbRef, message.payload)
      .then(() => {
        // Trigger a local notification when the cloud database successfully confirms receipt
        chrome.notifications.create({
          type: "basic",
          iconUrl: "icon.png",
          title: "Airtabs Cloud",
          message: `Successfully broadcasted ${message.payload.tabs.length} tab(s) to the cloud network.`
        });
      })
      .catch((error) => console.error("Firebase push failed:", error));
    } // This bracket closes the SEND_TABS block

    if (message.type === "FETCH_NETWORK_TABS") {
      console.log("Fetching tabs from cloud...");
      
      const dbRef = ref(db);
      get(child(dbRef, 'broadcasted_tabs')).then((snapshot) => {
        if (snapshot.exists()) {
          sendResponse({ data: snapshot.val() });
        } else {
          sendResponse({ data: null });
        }
      }).catch((error) => {
        console.error("Fetch failed:", error);
        sendResponse({ data: null });
      });
      
      return true; 
    }

}); 

// 6. THE INCOMING LISTENER (This runs silently in the background)// 
// The millisecond ANY device pushes data to 'broadcasted_tabs', this fires instantly!
onChildAdded(tabsDbRef, (snapshot) => {
  const incomingData = snapshot.val();
  
  // Prevent showing a notification if you were the one who sent it
  if (incomingData.sender === "Pluto's Mac") return;

  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: `Incoming Tabs from ${incomingData.sender}`,
    message: `Received ${incomingData.tabs.length} new tab(s). Open Airtabs to view.`
  });
});