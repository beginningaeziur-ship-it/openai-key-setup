import { useEffect } from 'react';

/**
 * Sets document.title for the current route.
 * Screen readers announce the document title on navigation.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
