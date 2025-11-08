# Keycloak Realm Setup - Quick Guide

## ✅ Do You Need to Create a New Realm?

### Short Answer: **NO, it's optional!**

You have **two options**:

---

## Option 1: Use Master Realm (Simplest - Recommended to Start)

**Use the default `master` realm** - it already exists and works!

### Steps:
1. **Nothing to do!** The `master` realm is already there
2. Just make sure your clients are created in the `master` realm
3. Update your `OIDC_ISSUER_URL` to use `/realms/master`

### Environment Variable:
```bash
OIDC_ISSUER_URL=https://auth.afribrok.com/realms/master
# OR locally:
OIDC_ISSUER_URL=http://localhost:8080/realms/master
```

### Pros:
- ✅ No setup needed
- ✅ Works immediately
- ✅ Good for testing/development
- ✅ Can always create a dedicated realm later

### Cons:
- ⚠️ Less secure (shared with Keycloak admin)
- ⚠️ Not ideal for production (but works fine)

---

## Option 2: Create a Dedicated Realm (Recommended for Production)

**Create a new realm** for better security and organization.

### Steps:
1. Go to **Realm selector** (top left, dropdown) → **Create realm**
2. **Realm name**: `afribrok`
3. Click **Create**
4. That's it! Default settings work fine

### Environment Variable:
```bash
OIDC_ISSUER_URL=https://auth.afribrok.com/realms/afribrok
# OR locally:
OIDC_ISSUER_URL=http://localhost:8080/realms/afribrok
```

### Pros:
- ✅ Better security (separate from Keycloak admin)
- ✅ Better organization
- ✅ Recommended for production
- ✅ Can customize settings per realm

### Cons:
- ⚠️ Extra step to set up
- ⚠️ Need to recreate clients in new realm

---

## 🎯 What You MUST Do (Regardless of Realm Choice)

### 1. Create Roles (IMPORTANT!)

**You MUST create these roles** in Keycloak (in whichever realm you use):

1. Go to **Realm roles** (NOT Client roles - use Realm roles!)
   - In Keycloak Admin Console, click **Realm roles** in the left sidebar
   - This is different from **Client roles** - make sure you're in **Realm roles**
   
2. Click **Create role** button (top right)

3. Create these roles one by one:
   - **Role name**: `SUPER_ADMIN` → Click **Save**
   - **Role name**: `TENANT_ADMIN` → Click **Save**
   - **Role name**: `BROKER` → Click **Save**
   - **Role name**: `INSPECTOR` → Click **Save**
   - **Role name**: `AGENT` → Click **Save**

**Important:** 
- ✅ Use **Realm roles** (not Client roles)
- ✅ Create them in the same realm where your clients are
- ✅ Role names must match exactly: `SUPER_ADMIN`, `TENANT_ADMIN`, etc. (uppercase)

**Why?** Your application uses these roles to control access. They need to exist in Keycloak so they can be included in JWT tokens.

### 2. Create Test Users (IMPORTANT!)

1. Go to **Users** → **Create new user**
2. Fill in:
   - **Username**: (e.g., `admin@afribrok.com`)
   - **Email**: (e.g., `admin@afribrok.com`)
   - **Email verified**: `ON`
   - **Enabled**: `ON`
3. Click **Create**

4. **Set Password:**
   - Go to **Credentials** tab
   - Click **Set password**
   - Enter password
   - **Temporary**: `OFF` (so user doesn't have to change it)
   - Click **Save**

5. **Assign Role:**
   - Go to **Role mapping** tab
   - Click **Assign role** button
   - **IMPORTANT:** Make sure you're looking in the right place:
     - Click **Filter by clients** dropdown → Select **Filter by realm roles** (or just look at the list)
     - You should see your roles: `SUPER_ADMIN`, `TENANT_ADMIN`, `BROKER`, `INSPECTOR`, `AGENT`
   - If you don't see them:
     - ✅ Make sure you created them in **Realm roles** (not Client roles)
     - ✅ Make sure you're in the same realm where you created the roles
     - ✅ Check that the roles actually exist: Go to **Realm roles** and verify they're listed
   - Select the appropriate role (e.g., `SUPER_ADMIN`)
   - Click **Assign**

### 3. Configure Role Mapper (IMPORTANT!)

To include roles in JWT tokens:

1. Go to **Clients** → Select `core-api` client
2. Go to **Client scopes** tab
3. Click on **dedicated** (or find the client's scopes)
4. Go to **Mappers** tab
5. Click **Create mapper**
6. **Mapper type**: `User Realm Role`
7. **Name**: `realm roles`
8. **Token Claim Name**: `roles` (or `realm_access.roles`)
9. **Add to access token**: `ON`
10. **Add to ID token**: `ON`
11. Click **Save**

**Repeat for `mobile-inspector` client** if needed.

---

## 📝 Quick Checklist

### Minimum Required (Using Master Realm):
- [x] Clients created (`core-api` and `mobile-inspector`) ✅
- [ ] Roles created in `master` realm (SUPER_ADMIN, TENANT_ADMIN, BROKER, INSPECTOR, AGENT)
- [ ] Test users created and roles assigned
- [ ] Role mapper configured to include roles in tokens
- [ ] `OIDC_ISSUER_URL` set to `/realms/master`

### Recommended (Creating New Realm):
- [ ] New realm `afribrok` created
- [ ] Clients recreated in new realm
- [ ] Roles created in new realm
- [ ] Test users created and roles assigned
- [ ] Role mapper configured
- [ ] `OIDC_ISSUER_URL` set to `/realms/afribrok`

---

## 🎯 My Recommendation

**For now (to get started quickly):**
1. ✅ Use `master` realm (no setup needed)
2. ✅ Create the roles in `master` realm
3. ✅ Create test users and assign roles
4. ✅ Configure role mapper

**Later (for production):**
- Create a dedicated `afribrok` realm
- Move clients to new realm
- Better security and organization

---

## ⚠️ Important Notes

1. **Roles are REQUIRED** - Your app uses them for authorization
2. **Role mapper is REQUIRED** - So roles appear in JWT tokens
3. **Realm choice is OPTIONAL** - Master works fine, dedicated is better for production
4. **Users must have roles assigned** - Otherwise they won't have permissions

---

## 🧪 Test Your Setup

1. **Test login:**
   - Try logging in with a test user
   - Check that JWT token includes roles

2. **Test role access:**
   - Login as SUPER_ADMIN → Should access super admin routes
   - Login as BROKER → Should access broker routes
   - Login as INSPECTOR → Should access inspector routes

---

## ✅ Summary

**Do you need to create a new realm?**
- **NO** - You can use `master` realm
- **YES** - If you want better security/organization (recommended for production)

**Do you need to create roles?**
- **YES** - This is REQUIRED! Your app needs these roles.

**Do you need to configure realm settings?**
- **NO** - Defaults work fine
- **YES** - If you want to customize (optional)

**Bottom line:** Use `master` realm for now, but **definitely create the roles and assign them to users!**

