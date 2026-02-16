# Deploy this site to GitHub Pages

The `deploy-pages` action often returns **404** when Pages isn’t set to “GitHub Actions”. Using **Deploy from a branch** avoids that and updates the site on every push.

## One-time setup (do this once)

1. Open **https://github.com/smfardeen7/port/settings/pages**
2. Under **Build and deployment**:
   - **Source:** select **Deploy from a branch** (not “GitHub Actions”).
   - **Branch:** `main`
   - **Folder:** **/ (root)**
3. Click **Save**

## What happens after

- Every push to `main` runs the **Build** job in Actions (green).
- GitHub serves the **root** of `main` as the site, so each push **is** the deploy.
- Live site: **https://smfardeen7.github.io/port/**
