import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef()

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    // Perform navigation if the react navigation is ready to handle actions
    navigationRef.navigate(name, params);
  } 
}
