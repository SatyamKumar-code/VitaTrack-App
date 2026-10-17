const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build',
  'TopicSubscriptionModule.android.js'
);

if (fs.existsSync(targetPath)) {
  const content = fs.readFileSync(targetPath, 'utf8');
  if (!content.includes('try {')) {
    const patched = `import { requireNativeModule } from 'expo-modules-core';
let moduleInstance;
try {
  moduleInstance = requireNativeModule('ExpoTopicSubscriptionModule');
} catch {
  moduleInstance = {
    addListener: () => {},
    removeListeners: () => {},
    subscribeToTopicAsync: () => Promise.resolve(null),
    unsubscribeFromTopicAsync: () => Promise.resolve(null),
  };
}
export default moduleInstance;
//# sourceMappingURL=TopicSubscriptionModule.android.js.map
`;
    fs.writeFileSync(targetPath, patched, 'utf8');
    console.log('[patch-expo-notifications] Successfully patched TopicSubscriptionModule.android.js for Expo Go');
  }
}
