import { useEffect } from 'react';

type AnalyticsEvent = {
  name: string;
  payload?: Record<string, unknown>;
};

export function useAnalytics(events: AnalyticsEvent[]) {
  useEffect(() => {
    // Hook reserved for GTM/analytics providers
    events.forEach((event) => {
      // eslint-disable-next-line no-console
      console.debug('[analytics:event]', event.name, event.payload ?? {});
    });
  }, [events]);
}
