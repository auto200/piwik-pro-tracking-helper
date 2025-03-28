import { useEffect, useState } from 'react';
import { browser } from 'wxt/browser';

type StoredLastCheck = { ts: number; version: string };

const LS_KEY = 'last_release_check';
export function useExtensionVersionMaybeNotLatest() {
  const [maybeNotLatest, setMaybeNotLatest] = useState<{ current: string; latest: string } | false>(
    false
  );

  useEffect(() => {
    const currentVersion = browser.runtime.getManifest().version;
    const lastCheck = localStorage.getItem(LS_KEY);
    if (lastCheck) {
      const { ts, version } = JSON.parse(lastCheck) as StoredLastCheck;
      if (Date.now() - ts <= 1000 * 60 * 60) {
        setMaybeNotLatest(
          currentVersion !== version ? { current: currentVersion, latest: version } : false
        );
        return;
      }
    }

    const getLatestRelease = async () => {
      try {
        const res = await fetch(
          'https://api.github.com/repos/auto200/piwik-pro-tracking-helper/releases/latest'
        );
        if (!res.ok) return;
        const { tag_name } = (await res.json()) as { tag_name: string };
        const lastCheckToStore: StoredLastCheck = { ts: Date.now(), version: tag_name };
        localStorage.setItem(LS_KEY, JSON.stringify(lastCheckToStore));
        if (currentVersion !== tag_name) {
          setMaybeNotLatest({ current: currentVersion, latest: tag_name });
        }
      } catch {}
    };
    getLatestRelease();
  }, []);

  return maybeNotLatest;
}
