# 🚀 Airtabs

**AirDrop for your browser tabs.** A lightweight, fast browser extension that lets you broadcast and sync open tabs across all your devices instantly.

---

## ✨ Features

- **📡 Instant Broadcasting**: Select specific tabs or select all, and push them to your network with one click.
- **📥 Network History**: View a history of incoming tabs sent from other devices and open them in bulk.
- **🔔 Native Notifications**: Get instantly notified via the browser when a new batch of tabs is pushed to your network.
- **⚡ Realtime Sync**: Built on Firebase Realtime Database for blazing-fast, lightweight syncing.
- **💻 Cross-Platform**: Send tabs from your Mac, open them on your PC (Safari support coming soon!).

## 📸 Sneak Peek


## 🛠️ Installation (Developer Mode)

Currently, Airtabs is in development and can be installed as an unpacked extension.

### 1. Clone the repository

```bash
git clone [https://github.com/mpluto-o/Airtabs.git](https://github.com/mpluto-o/Airtabs.git)
cd Airtabs
```

### 2. Set up Firebase
To keep your data private, Airtabs requires you to connect your own Firebase Realtime Database. 
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Create a **Realtime Database** and set the security rules to allow read/writes.
3. Register a web app in your Firebase project to get your configuration keys.
4. Create a file named `firebase-config.js` in the root of this extension directory and add your keys:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Load into any Chromium based browser
1. Open Chrome (or any Chromium browser like Brave/Edge) and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** ON in the top right corner.
3. Click **Load unpacked** and select the `Airtabs` folder you just cloned.
4. Pin the extension to your toolbar and start syncing!

## 🛣️ Roadmap
- [x] Chromium extension core functionality
- [x] Firebase Realtime Database integration
- [ ] Convert and package for Safari via Xcode
- [ ] Implement Firebase App Check for enhanced security
- [ ] Add Tab Group support

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](../../issues).

## 📝 License
This project is open source and available under the [MIT License](LICENSE).