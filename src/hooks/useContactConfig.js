import { useState, useEffect } from 'react';
import { defaultContactConfig } from '@/lib/models/ContactConfig';

/**
 * Custom hook để fetch và cache contact config
 */
export function useContactConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/config/contact');
        const data = await res.json();
        if (data.success) {
          setConfig(data.data);
        } else {
          setError(data.error);
          // Fallback to defaults
          setConfig(defaultContactConfig);
        }
      } catch (err) {
        console.error('Error fetching contact config:', err);
        setError(err.message);
        // Fallback to defaults
        setConfig(defaultContactConfig);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
}
