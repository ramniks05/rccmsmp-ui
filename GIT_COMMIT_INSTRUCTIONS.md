# Git Commit Instructions

## Quick Commit (Using Batch Script)

1. **Run the batch script:**
   ```cmd
   commit-changes.bat
   ```

   This will:
   - Create a new branch with timestamp
   - Add all changes
   - Commit with a descriptive message
   - Show you the branch name for pushing

2. **Push to remote (optional):**
   ```cmd
   git push -u origin <branch-name>
   ```

## Manual Commit Steps

If you prefer to do it manually:

### 1. Check current status
```cmd
git status
```

### 2. Create and checkout new branch
```cmd
git checkout -b feature/citizen-home-<date>
```

Example:
```cmd
git checkout -b feature/citizen-home-20241215
```

### 3. Add all changes
```cmd
git add .
```

### 4. Commit with message
```cmd
git commit -m "feat: Add citizen home page and authentication flow

- Created CitizenModule with routing for /citizen/home
- Implemented CitizenHomeComponent with welcome page
- Added quick actions (My Cases, New Case, Case History, My Profile)
- Integrated mobile OTP verification during registration
- Updated login component to redirect citizens to /citizen/home
- Added refresh token API integration
- Updated registration to use registration-specific OTP endpoint
- Added authentication check and user data display
- Implemented responsive design for citizen home page"
```

### 5. Push to remote (optional)
```cmd
git push -u origin feature/citizen-home-<date>
```

## What's Included in This Commit

### New Features:
- ✅ Citizen home page (`/citizen/home`)
- ✅ Mobile OTP verification during registration
- ✅ Registration-specific OTP endpoint integration
- ✅ Refresh token API integration
- ✅ Authentication-based routing

### Files Added:
- `src/app/citizen/citizen.module.ts`
- `src/app/citizen/citizen-home/citizen-home.component.ts`
- `src/app/citizen/citizen-home/citizen-home.component.html`
- `src/app/citizen/citizen-home/citizen-home.component.scss`
- `src/app/core/interceptors/auth.interceptor.ts`

### Files Modified:
- `src/app/app-routing.module.ts` - Added citizen routes
- `src/app/pages/login/login.component.ts` - Updated redirect logic
- `src/app/core/services/api.service.ts` - Added refresh token and registration OTP methods
- `src/app/core/services/auth.service.ts` - Added token refresh functionality
- `src/app/core/core.module.ts` - Registered auth interceptor
- `src/app/pages/registration/registration.component.ts` - Added mobile verification
- `src/app/pages/registration/registration.component.html` - Added mobile verification UI
- `src/app/pages/registration/registration.component.scss` - Added mobile verification styles

## Branch Naming Convention

The batch script creates branches with format:
```
feature/citizen-home-YYYYMMDD-HHMMSS
```

Example: `feature/citizen-home-20241215-143022`

## Notes

- All changes are automatically staged
- The commit message follows conventional commits format
- You can modify the branch name or commit message as needed
- Remember to push to remote if you want to share the branch

