import { useEffect, useState } from 'react';

export default function SimpleMapTest() {
  const [status, setStatus] = useState<string>('Loading...');
  const [features, setFeatures] = useState<any[]>([]);

  useEffect(() => {
    const basePath = window.location.hostname === 'localhost'
      ? '/data/geo/ca-counties-ultra-low.geojson'
      : '/california_puzzle_game/data/geo/ca-counties-ultra-low.geojson';

    setStatus(`Fetching from: ${basePath}`);

    fetch(basePath)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(data => {
        setStatus(`Loaded ${data?.features?.length || 0} features`);
        setFeatures(data?.features || []);
      })
      .catch(error => {
        setStatus(`Error: ${error.message}`);
      });
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-2">Map Test</h3>
      <p className="text-sm">Status: {status}</p>
      {features.length > 0 && (
        <div className="mt-2">
          <p className="text-xs">First 5 counties:</p>
          <ul className="text-xs">
            {features.slice(0, 5).map((f, i) => (
              <li key={i}>{f.properties?.NAME || 'Unknown'}</li>
            ))}
          </ul>
          <svg width="400" height="300" className="border mt-2">
            {features.map((feature, idx) => {
              // Simple rendering just to test
              const coords = feature.geometry?.coordinates?.[0]?.[0]?.[0] || [0, 0];
              const x = ((coords[0] + 124) / 10) * 400;
              const y = ((42 - coords[1]) / 10) * 300;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r="2"
                  fill="red"
                  title={feature.properties?.NAME}
                />
              );
            })}
          </svg>
        </div>
      )}
    </div>
  );
}