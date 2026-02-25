# Deploy this site

## Vercel (fardeen.bio) — GitHub updates → live site

Your live site is **https://fardeen.bio/** on Vercel. To have every push to `main` update the site, use **one** of these:

### Option A: Connect GitHub in Vercel (easiest)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) → your **fardeen.bio** project.
2. **Settings** → **Git**.
3. Under **Connected Git Repository**, click **Connect** and choose the repo (e.g. `smfardeen7/port`).
4. Set **Production Branch** to `main` and save.
5. From then on, every **push to `main`** triggers a Vercel deploy; the site updates in about a minute.

### Option B: Deploy from GitHub Actions

The workflow `.github/workflows/deploy-vercel.yml` deploys to Vercel on every push to `main`. You only need to add three **repository secrets** once.

1. **Get a Vercel token**  
   [vercel.com/account/tokens](https://vercel.com/account/tokens) → Create → copy the token.

2. **Get Org ID and Project ID**  
   In your project folder run:
   ```bash
   npx vercel link
   ```
   Choose your scope and link the existing project. Then open `.vercel/project.json` — it has `orgId` and `projectId`. (If you use a team, `orgId` is the team id.)

3. **Add GitHub secrets**  
   Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add:
   - `VERCEL_TOKEN` = token from step 1  
   - `VERCEL_ORG_ID` = `orgId` from `.vercel/project.json`  
   - `VERCEL_PROJECT_ID` = `projectId` from `.vercel/project.json`

4. Push to `main`. The **Deploy to Vercel** workflow will run and update https://fardeen.bio/.

---

## GitHub Pages (optional)

The `deploy-pages` action often returns **404** when Pages isn’t set to “GitHub Actions”. Using **Deploy from a branch** avoids that.

1. Open **https://github.com/smfardeen7/port/settings/pages**
2. **Source:** **Deploy from a branch** | **Branch:** `main` | **Folder:** **/ (root)** → Save.
3. Live site: **https://smfardeen7.github.io/port/**
