# Troubleshooting Guide

## Issue: Nothing Opens in Browser

### Step 1: Check if Server is Running
Look at your terminal/PowerShell window. You should see:
```
✔ Compiled successfully.
** Angular Live Development Server is listening on localhost:4200 **
```

### Step 2: Manually Open Browser
If the browser didn't open automatically:
1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Navigate to: `http://localhost:4200`

### Step 3: Check Browser Console for Errors
1. Open Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Look for any red error messages
4. Share the error messages if you see any

### Step 4: Common Issues and Solutions

#### Blank White Page
- **Check Console**: Open browser DevTools (F12) → Console tab
- **Check Network Tab**: Look for failed requests (red entries)
- **Verify Dependencies**: Run `npm install` again

#### Compilation Errors
- Check terminal for TypeScript errors
- Make sure all files are saved
- Try stopping the server (Ctrl+C) and restarting with `ng serve`

#### Port Already in Use
If you see "Port 4200 is already in use":
```bash
ng serve --port 4201
```
Then navigate to `http://localhost:4201`

#### Module Not Found Errors
If you see module errors:
```bash
npm install
ng serve
```

### Step 5: Verify Installation
Make sure all dependencies are installed:
```bash
npm install
```

### Step 6: Clear Cache and Rebuild
```bash
# Stop the server (Ctrl+C)
rm -rf node_modules
rm package-lock.json
npm install
ng serve
```

## Expected Behavior

When the app loads successfully, you should see:
1. **Header**: Blue toolbar with "RCCMS" title
2. **Main Content**: 
   - Large heading: "Management System"
   - Subheading: "Government of Manipur"
   - A welcome card with text
3. **Footer**: Blue footer with "NIC | Government of Manipur"

## Still Having Issues?

Please share:
1. Terminal output when running `ng serve`
2. Browser console errors (F12 → Console tab)
3. Any error messages you see

