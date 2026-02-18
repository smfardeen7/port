# Get Your Portfolio Live (One-Time Setup)

The `deploy-pages` action returns **404** for this repo, so deployment uses **Deploy from a branch** instead. Do this once to get your URL.

## Your live URL (after setup)

**https://smfardeen7.github.io/port/**

## Steps (2 minutes)

1. Open: **https://github.com/smfardeen7/port/settings/pages**
2. Under **"Build and deployment"**:
   - **Source:** select **"Deploy from a branch"** (not "GitHub Actions").
   - **Branch:** choose **`main`**
   - **Folder:** choose **`/ (root)`**
3. Click **Save**.

Wait 1–2 minutes. Then open **https://smfardeen7.github.io/port/** — your portfolio will be live.

Every push to `main` will update the site automatically. The Actions workflow runs **Build** only; the branch itself is the deployment.
