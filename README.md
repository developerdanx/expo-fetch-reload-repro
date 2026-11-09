# expo/fetch crash on reload (SDK 56, iOS)

Minimal repro: a blank SDK 56 app crashes on iOS when `expo/fetch` requests are still waiting for response headers while the React instance reloads.

```sh
npm install
node server.js                                  # terminal 1
npx expo run:ios --configuration Release        # terminal 2
```

`App.tsx` starts 150 requests that never get response headers. After 0.4–1.6 s, it asks `server.js` to drop those sockets within 0–800 ms and calls `reloadAppAsync()`. The app crashes on the first reload (10 of 10 launches on an iOS 26.5 simulator), on the `expo.modules.fetch.RequestQueue` thread inside `ExpoModulesJSI`.
