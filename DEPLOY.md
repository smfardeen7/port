# Deploy this site to GitHub Pages

The workflow in Actions **builds** on every push. The **deploy** happens automatically when you use "Deploy from a branch" (no 404, no extra step).

## One-time setup

1. Open **https://github.com/smfardeen7/port/settings/pages**
2. Under **Build and deployment**:
   - **Source:** choose **Deploy from a branch**
   - **Branch:** `main`
   - **Folder:** **/ (root)**
3. Click **Save**

## Result

- Every push to `main` runs the **Build** workflow in Actions.
- GitHub Pages serves the **root** of `main`, so the site updates on each push.
- Live site: **https://smfardeen7.github.io/port/**

No "Deploy" job is needed; the branch itself is the deployment.
