import { NEXT_PUBLIC_BASE_URL } from './env';

export default {
  keys: {
    PUSH_PREVIOUSLY_GRANTED: 'push_previously_granted',
  },
  serverUrl: NEXT_PUBLIC_BASE_URL,
};

export const linking = {
  // Prefixes accepted by the navigation container, should match the added schemes
  prefixes: [
    'https://nonprod.royalties.umgapps.com/*',
    'https://qa.royalties.umgapps.com/*',
    'https://stage.royalties.umgapps.com/*',
    'https://uat.royalties.umgapps.com/*',
    'https://preprod.royalties.umgapps.com/*',
    'https://royalties.umgapps.com/*',
    'com.royaltiesportal://',
  ],
};
