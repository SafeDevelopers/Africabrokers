# CapRover Git Deployment with Deploy Key

This guide explains how to set up Git deployment in CapRover using a deploy key (SSH key).

## What is a Deploy Key?

A deploy key is an SSH key that gives CapRover read-only access to your private Git repository. This is more secure than using your personal access token.

## Step 1: Generate SSH Deploy Key

### On Your Local Machine

1. **Generate a new SSH key** (if you don't have one for CapRover):

```bash
# Generate a new SSH key pair (use a descriptive name)
ssh-keygen -t ed25519 -C "caprover-deploy-key" -f ~/.ssh/caprover_deploy_key

# Or if ed25519 is not available, use RSA:
ssh-keygen -t rsa -b 4096 -C "caprover-deploy-key" -f ~/.ssh/caprover_deploy_key
```

**Important**: 
- **Do NOT enter a passphrase** (press Enter when prompted)
- The key will be saved as:
  - Private key: `~/.ssh/caprover_deploy_key` (keep this secret!)
  - Public key: `~/.ssh/caprover_deploy_key.pub` (add this to GitHub)

2. **View the public key** (you'll need this for GitHub):

```bash
cat ~/.ssh/caprover_deploy_key.pub
```

Copy the entire output - it should look like:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... caprover-deploy-key
```

## Step 2: Add Deploy Key to GitHub

1. **Go to your GitHub repository**
2. **Settings** → **Deploy keys** (in the left sidebar)
3. Click **Add deploy key**
4. Fill in:
   - **Title**: `CapRover Deploy Key` (or any descriptive name)
   - **Key**: Paste the public key from Step 1 (the `.pub` file content)
   - ✅ **Allow write access**: Leave unchecked (read-only is sufficient for deployment)
5. Click **Add key**

**Note**: If you need to push changes from CapRover (e.g., for CI/CD), check "Allow write access". For most deployments, read-only is sufficient.

## Step 3: Add Deploy Key to CapRover

### Option A: Add Deploy Key to CapRover (Recommended)

1. **Go to CapRover Dashboard**
2. **Settings** → **Deploy Keys** (or **SSH Keys**)
3. Click **Add Deploy Key** (or **Add SSH Key**)
4. **Name**: `github-deploy-key` (or any descriptive name)
5. **Private Key**: Paste the **private key** content from Step 1:

```bash
# View the private key
cat ~/.ssh/caprover_deploy_key
```

Copy the entire output (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

6. Click **Save**

### Option B: Add Deploy Key Per App (Alternative)

Some CapRover versions allow you to add deploy keys per app:

1. Go to your app → **App Configs** → **Deploy Key**
2. Paste the private key
3. Save

## Step 4: Deploy App from Git in CapRover

1. **Go to CapRover Dashboard** → **Apps** → **One-Click Apps/Dockerfile**
2. Click **Deploy from GitHub/Bitbucket/GitLab**
3. Fill in the form:

   **App Name**: `core-api`
   
   **Repository URL**: 
   - For GitHub: `git@github.com:your-username/your-repo.git` (SSH format)
   - Or: `https://github.com/your-username/your-repo.git` (HTTPS format)
   
   **Branch**: `main` (or your deployment branch)
   
   **Dockerfile Path**: `services/core-api/Dockerfile`
   
   **Context Path**: `/` (root of repository)
   
   **Deploy Key**: Select the deploy key you added in Step 3 (if using per-app keys)

4. Click **Deploy**

## Step 5: Verify Deployment

1. **Check App Status**: Go to Apps → `core-api` → Should show "Running"
2. **Check App Logs**: Go to Apps → `core-api` → App Logs → Look for build/deployment logs
3. **Test Health Endpoint**:
   ```bash
   curl https://api.afribrok.com/healthz
   ```

## Troubleshooting

### "Permission denied (publickey)" Error

**Problem**: CapRover can't access your repository.

**Solutions**:
1. Verify the public key is added to GitHub:
   - Go to GitHub → Repository → Settings → Deploy keys
   - Verify the key is listed and enabled
2. Verify the private key is correct in CapRover:
   - Check that you copied the **private key** (not public key) to CapRover
   - Verify the key format is correct (includes BEGIN/END markers)
3. Try regenerating the key pair and adding again

### "Repository not found" Error

**Problem**: CapRover can't find your repository.

**Solutions**:
1. Verify the repository URL is correct:
   - Use SSH format: `git@github.com:username/repo.git`
   - Or HTTPS format: `https://github.com/username/repo.git`
2. Verify the deploy key has access to the repository
3. Check if the repository is private (deploy key is required for private repos)

### "Dockerfile not found" Error

**Problem**: CapRover can't find the Dockerfile.

**Solutions**:
1. Verify the Dockerfile path is correct:
   - Should be: `services/core-api/Dockerfile` (relative to repo root)
2. Verify the context path is correct:
   - Should be: `/` (root of repository)
3. Check that the Dockerfile exists in the specified branch

### Build Fails

**Problem**: Docker build fails during deployment.

**Solutions**:
1. Check App Logs for build errors
2. Verify all required files are in the repository
3. Check if dependencies are available (pnpm, node, etc.)
4. Verify environment variables are set correctly

## Security Best Practices

1. **Use Deploy Keys (not Personal Access Tokens)**:
   - Deploy keys are repository-specific and can be revoked easily
   - Personal access tokens have broader access

2. **Don't Commit Private Keys**:
   - Never commit the private key to your repository
   - Keep the private key secure and only add it to CapRover

3. **Use Read-Only Access**:
   - For deployments, read-only access is sufficient
   - Only enable write access if you need to push changes from CapRover

4. **Rotate Keys Regularly**:
   - Periodically regenerate deploy keys
   - Remove old keys from GitHub and CapRover

5. **Use Different Keys for Different Environments**:
   - Use separate deploy keys for staging and production
   - Makes it easier to revoke access if needed

## Alternative: Using Personal Access Token (Not Recommended)

If you prefer to use HTTPS with a personal access token instead of SSH:

1. **Generate Personal Access Token**:
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `repo` scope
   - Copy the token

2. **Use HTTPS URL in CapRover**:
   - Repository URL: `https://github.com/username/repo.git`
   - Username: Your GitHub username
   - Password: The personal access token

**Note**: This is less secure than deploy keys because:
- Tokens have broader access (all your repos)
- Tokens are harder to revoke if compromised
- Tokens can expire and break deployments

## Summary

✅ **Generate SSH key pair** (public + private)  
✅ **Add public key to GitHub** (Deploy keys)  
✅ **Add private key to CapRover** (Settings → Deploy Keys)  
✅ **Deploy app from Git** (use SSH URL format)  
✅ **Verify deployment** (check logs and test endpoints)  

Your app should now deploy automatically when you push to the specified branch!

