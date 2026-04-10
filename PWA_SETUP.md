# Progressive Web App (PWA) Setup

LifeBalanceOS is now configured as a Progressive Web App! Here's what has been implemented.

## What's Included

### 1. **Service Worker** (`public/sw.js`)
- Cache-first strategy for static assets
- Network-first strategy for API calls
- Offline fallback support
- Background sync capability
- Push notification support

### 2. **Web App Manifest** (`public/manifest.json`)
- App metadata (name, description, theme colors)
- Installation configuration
- App shortcuts for quick access
- Icon definitions

### 3. **Offline Support** (`public/offline.html`)
- Fallback page when offline
- User-friendly offline message
- Suggestions for what's available offline

### 4. **PWA Configuration**
- `next.config.mjs` - PWA plugin setup with caching strategies
- `layout.tsx` - Meta tags and manifest link
- `pwaManager.ts` - Client-side PWA utilities

### 5. **PWA Install Button Component**
- Located at `src/components/common/PWAInstallButton.tsx`
- Shows install prompt when available
- Handles installation flow

## Features

### ✅ Supported Features

1. **Installation**
   - Users can install the app on their home screen
   - Works on iOS, Android, Windows, and Mac

2. **Offline Functionality**
   - Static assets are cached
   - Previously visited pages are available offline
   - Service worker ensures smooth offline experience

3. **Caching Strategies**
   - **Static Assets** (JS, CSS): Cache-first
   - **Images**: Stale-while-revalidate
   - **Google Fonts**: Long-term caching
   - **API Calls**: Network-first with fallback
   - **Third-party Libraries**: Cache-first

4. **Background Features**
   - Background data sync
   - Push notifications
   - Periodic background sync

5. **Standalone Mode**
   - App runs full-screen without browser UI
   - Native app-like experience
   - Custom splash screen

## How to Use

### Adding the Install Button

Add the PWA install button to your navbar or header:

```tsx
import PWAInstallButton from '@/components/common/PWAInstallButton';

export default function Navbar() {
  return (
    <nav>
      <h1>LifeBalanceOS</h1>
      <PWAInstallButton />
    </nav>
  );
}
```

### Using PWA Features in Components

```tsx
import { pwaManager } from '@/lib/pwaManager';
import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    setIsInstalled(pwaManager.isInstalledPWA());
  }, []);

  const handleShare = async () => {
    const shared = await pwaManager.share({
      title: 'Check out my goals!',
      text: 'I achieved my weekly goals!',
      url: '/goals',
    });
    
    if (shared) {
      console.log('Successfully shared');
    }
  };

  const handleRegisterNotifications = async () => {
    const registered = await pwaManager.registerNotifications();
    if (registered) {
      console.log('Push notifications enabled');
    }
  };

  return (
    <div>
      <p>App is {isInstalled ? 'installed' : 'not installed'} as PWA</p>
      <button onClick={handleShare}>Share Goal</button>
      <button onClick={handleRegisterNotifications}>Enable Notifications</button>
    </div>
  );
}
```

### Checking PWA Installation Status

```tsx
import { pwaManager } from '@/lib/pwaManager';

// Check if running as installed PWA
const isInstalled = pwaManager.isInstalledPWA();

// Check if fullscreen mode
const isFullscreen = pwaManager.isFullscreen();

// Check if can install
const canInstall = pwaManager.canInstall();
```

## Testing the PWA

### Desktop Testing
1. **Chrome/Edge**: 
   - Open DevTools (F12)
   - Go to Application > Manifest
   - Look for "Install" button or use the install icon in address bar

2. **Firefox**: 
   - PWA support for Firefox is growing
   - Check "Install" option when available

### Mobile Testing
1. **Android**:
   - Open the app in Chrome
   - Tap the three-dot menu → "Install app"
   - Or look for the install banner at the bottom

2. **iOS**:
   - Open in Safari
   - Tap Share → "Add to Home Screen"
   - The web app will be added to your home screen

### Testing Offline
1. Open DevTools
2. Go to Application > Service Workers
3. Check "Offline" checkbox
4. Reload the page
5. The app should work offline with cached content

## Configuration Files

### `next.config.mjs`
Configures the PWA plugin with:
- Caching strategies for different asset types
- Cache size limits
- Runtime caching rules

### `public/manifest.json`
Contains:
- App name and short name
- Icons (SVG and PNG)
- App shortcuts
- Theme color
- Background color
- Display mode (standalone)

### `src/app/layout.tsx`
Includes:
- Manifest link
- PWA meta tags
- Theme color
- Apple web app configuration
- Viewport configuration

### `public/sw.js`
Service worker with:
- Cache management
- Fetch intercept and caching
- Offline fallback
- Push notification handling
- Background sync

### `src/lib/pwaManager.ts`
Client-side utilities for:
- Install prompt handling
- Notification registration
- Background sync
- Web Share API
- Device capability detection

## Environment Variables

Optional: Set up VAPID keys for push notifications:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key
```

## Next Steps

To fully complete the PWA setup, you should:

1. **Create high-res icons** (192x512px PNG files)
   - Add `public/logo-192.png`
   - Add `public/logo-512.png`
   - Update manifest.json if using these files

2. **Add splash screens** for better app launch experience
   - Create adaptive icons for Android
   - Add iOS splash screens

3. **Implement push notifications**
   - Set up VAPID keys
   - Create backend endpoint for sending notifications
   - Implement notification UI

4. **Enable background sync**
   - Implement sync endpoints
   - Handle data synchronization
   - Show sync status to users

5. **Test thoroughly**
   - Test on various browsers and devices
   - Verify cache invalidation
   - Test offline scenarios
   - Validate installation on different platforms

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [manifest.json Reference](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Troubleshooting

### Install button not showing
- Check if app HTTPS (required) - localhost works for development
- Verify manifest.json is accessible
- Check browser console for errors

### Service worker not caching
- Check DevTools > Application > Cache Storage
- Ensure service worker is registered
- Look for errors in DevTools > Application > Service Workers

### Offline page showing on online
- Clear cache: DevTools > Application > Clear Storage
- Unregister service worker and reload
- Check network in DevTools

## Support

For PWA-related issues or questions, refer to:
- Next-PWA documentation
- Web.dev PWA guides
- Browser-specific PWA support pages
