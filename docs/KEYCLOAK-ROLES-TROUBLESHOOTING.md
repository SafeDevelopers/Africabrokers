# Keycloak Roles Not Showing - Troubleshooting Guide

## 🔍 Problem: Roles Not Showing When Assigning to User

When you go to **Users** → Select user → **Role mapping** → **Assign role**, you don't see the roles you created.

## ✅ Solution Steps

### Step 1: Verify Roles Were Created in Realm Roles

1. Go to **Realm roles** (left sidebar)
2. Check if your roles are listed:
   - `SUPER_ADMIN`
   - `TENANT_ADMIN`
   - `BROKER`
   - `INSPECTOR`
   - `AGENT`

**If roles are NOT there:**
- You need to create them first (see Step 2)

**If roles ARE there:**
- Continue to Step 3

### Step 2: Create Roles in Realm Roles (Not Client Roles!)

**Common Mistake:** Creating roles in Client roles instead of Realm roles!

1. Go to **Realm roles** (left sidebar - NOT Client roles!)
2. Click **Create role** button (top right)
3. **Role name**: Enter one role at a time:
   - `SUPER_ADMIN` → Click **Save**
   - `TENANT_ADMIN` → Click **Save**
   - `BROKER` → Click **Save**
   - `INSPECTOR` → Click **Save**
   - `AGENT` → Click **Save**

**Important:**
- ✅ Must be in **Realm roles** (not Client roles)
- ✅ Must be in the same realm where your clients are
- ✅ Role names must be exact: `SUPER_ADMIN` (uppercase, underscore)

### Step 3: Assign Roles to User

1. Go to **Users** (left sidebar)
2. Click on a user (or create a new user first)
3. Go to **Role mapping** tab
4. Click **Assign role** button
5. **Look in the right place:**
   - You should see a dropdown or filter: **Filter by clients** or **Filter by realm roles**
   - Make sure you're looking at **Realm roles** (not Client roles)
   - If you see a search box, type the role name (e.g., `SUPER_ADMIN`)

### Step 4: If Still Not Showing

**Check 1: Are you in the right realm?**
- Look at the realm selector (top left)
- Make sure you're in the same realm where you created the roles
- If you created roles in `master` realm, make sure you're in `master` realm
- If you created roles in `afribrok` realm, make sure you're in `afribrok` realm

**Check 2: Did you create Realm roles or Client roles?**
- Go to **Realm roles** → Check if roles are listed
- If they're in **Client roles** instead, you need to create them in **Realm roles**

**Check 3: Refresh the page**
- Sometimes Keycloak UI needs a refresh
- Press `F5` or refresh the browser
- Try again

**Check 4: Check the filter/search**
- In the "Assign role" dialog, look for:
  - A dropdown that says "Filter by clients" → Change to "Filter by realm roles"
  - A search box → Type the role name
  - Tabs or sections → Look for "Realm roles" section

## 🎯 Step-by-Step: Create and Assign Roles

### 1. Create Roles (Realm Roles)

1. **Realm selector** (top left) → Select your realm (`master` or `afribrok`)
2. **Realm roles** (left sidebar) → Click it
3. **Create role** (top right button) → Click it
4. **Role name**: `SUPER_ADMIN` → Click **Save**
5. Repeat for each role:
   - `TENANT_ADMIN`
   - `BROKER`
   - `INSPECTOR`
   - `AGENT`

### 2. Verify Roles Exist

1. Go to **Realm roles** (left sidebar)
2. You should see all 5 roles listed:
   - `SUPER_ADMIN`
   - `TENANT_ADMIN`
   - `BROKER`
   - `INSPECTOR`
   - `AGENT`

### 3. Create a Test User

1. Go to **Users** (left sidebar)
2. **Create new user** (top right) → Click it
3. Fill in:
   - **Username**: `admin@afribrok.com`
   - **Email**: `admin@afribrok.com`
   - **Email verified**: Toggle **ON**
   - **Enabled**: Toggle **ON**
4. Click **Create**

5. **Set Password:**
   - Go to **Credentials** tab
   - Click **Set password**
   - Enter password
   - **Temporary**: Toggle **OFF**
   - Click **Save**

### 4. Assign Role to User

1. Still in the user page, go to **Role mapping** tab
2. Click **Assign role** button
3. **Look for the filter/search:**
   - If you see a dropdown: Select **"Filter by realm roles"** or **"Realm roles"**
   - If you see tabs: Click **"Realm roles"** tab
   - If you see a search box: Type `SUPER_ADMIN`
4. You should now see your roles listed
5. Check the box next to `SUPER_ADMIN` (or the role you want)
6. Click **Assign** button

## 🔍 Common Issues

### Issue 1: Roles Created in Client Roles Instead of Realm Roles

**Symptom:** Roles exist but don't show when assigning to users

**Solution:**
- Delete the roles from Client roles
- Create them in Realm roles instead
- Realm roles are global to the realm
- Client roles are specific to a client

### Issue 2: Wrong Realm Selected

**Symptom:** Can't find roles you created

**Solution:**
- Check realm selector (top left)
- Make sure you're in the same realm where you created the roles
- If you created roles in `master`, make sure you're in `master`
- If you created roles in `afribrok`, make sure you're in `afribrok`

### Issue 3: Filter Set to Client Roles

**Symptom:** See roles but they're client roles, not realm roles

**Solution:**
- In "Assign role" dialog, look for filter dropdown
- Change from "Filter by clients" to "Filter by realm roles"
- Or look for "Realm roles" tab/section

### Issue 4: Roles Not Saved

**Symptom:** Created role but it disappeared

**Solution:**
- Make sure you clicked **Save** after creating each role
- Check **Realm roles** page to verify roles exist
- If missing, create them again

## ✅ Quick Verification Checklist

- [ ] Roles created in **Realm roles** (not Client roles)
- [ ] Roles created in the same realm where clients are
- [ ] Role names are exact: `SUPER_ADMIN`, `TENANT_ADMIN`, etc. (uppercase)
- [ ] Roles visible in **Realm roles** page
- [ ] User created and password set
- [ ] In "Assign role" dialog, looking at **Realm roles** (not Client roles)
- [ ] Same realm selected when assigning roles

## 🎯 Visual Guide

### Where to Create Roles:
```
Keycloak Admin Console
├── Realm selector (top left) → Select realm
├── Realm roles (left sidebar) ← CREATE ROLES HERE
│   ├── Create role button
│   ├── SUPER_ADMIN
│   ├── TENANT_ADMIN
│   ├── BROKER
│   ├── INSPECTOR
│   └── AGENT
└── Client roles (left sidebar) ← NOT HERE!
```

### Where to Assign Roles:
```
Users
├── Select user
├── Role mapping tab
│   └── Assign role button
│       └── Filter by realm roles ← LOOK HERE
│           ├── SUPER_ADMIN
│           ├── TENANT_ADMIN
│           ├── BROKER
│           ├── INSPECTOR
│           └── AGENT
```

## 🆘 Still Not Working?

If roles still don't show:

1. **Screenshot the "Assign role" dialog** - What do you see?
2. **Check Realm roles page** - Are roles listed there?
3. **Check realm selector** - Which realm are you in?
4. **Try creating a role again** - Make sure it saves

The most common issue is creating roles in **Client roles** instead of **Realm roles**. Make sure you're creating them in **Realm roles**!

