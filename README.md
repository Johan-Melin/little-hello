# Little hello

[Open the live app](https://little-hello.vercel.app/)

A mobile-friendly friend reminder with contact frequencies, history, and average contact intervals. Data is saved in the current browser's local storage.

## Deploy on Vercel

Import `Johan-Melin/little-hello` into Vercel and click Deploy. Leave the import settings at their defaults; `vercel.json` configures the static `dist` folder and disables installation and build steps.

If the repository is already connected to Vercel, pushing to `main` triggers its configured deployment workflow.

Contact data belongs to each browser and site address. Existing contacts on the ChatGPT-hosted site do not automatically transfer to a Vercel address.

## Develop

Edit the HTML, CSS, and JavaScript in `dist`. No build step is needed. Serve that folder with a local static HTTP server.

Run the history checks with `node history.test.cjs`.

## Install and use offline

Little hello is a PWA. Open your HTTPS deployment while online and wait for **Ready offline**. On supported browsers, use **Install Little hello** or the browser's installation menu. On iPhone or iPad, use Safari's **Share → Add to Home Screen**, then open the home-screen app while online and wait for **Ready offline** there too.

Contacts and history work offline and stay in local storage. Installation does not add push reminders or device synchronization. The app uses system fonts without external font requests.

If an installed app fails to open offline, reconnect and open it online. If it shows **Update ready**, close all Little hello windows (including Safari tabs) and reopen online. Wait for **Ready offline**, then test by closing and reopening in airplane mode. Do not clear website data or delete the app as a troubleshooting step: contacts are stored locally. Offline readiness verifies the current cache; it cannot prevent the operating system from later removing website storage.

Run `node pwa.test.cjs` to check the manifest icons and service-worker cache behavior. When changing files in `dist`, increment the cache version in `dist/sw.js`. Updates activate after all existing app windows close, preserving open forms.
