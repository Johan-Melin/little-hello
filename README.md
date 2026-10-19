# Little hello

A mobile-friendly friend reminder with contact frequencies, history, and average contact intervals. Data is saved in the current browser's local storage.

## Deploy on Vercel

Import `Johan-Melin/little-hello` into Vercel and click Deploy. Leave the import settings at their defaults; `vercel.json` configures the static `dist` folder and disables installation and build steps.

If the repository is already connected to Vercel, pushing to `main` triggers its configured deployment workflow.

Contact data belongs to each browser and site address. Existing contacts on the ChatGPT-hosted site do not automatically transfer to a Vercel address.

## Develop

Edit the HTML, CSS, and JavaScript in `dist`. No build step is needed. Serve that folder with a local static HTTP server.

Run the history checks with `node history.test.cjs`.
