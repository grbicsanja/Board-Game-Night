import React, { useEffect, useState } from 'react';

interface ElapsedTimerProps {
  startedAt: number;
}

export const ElapsedTimer = React.memo(function ElapsedTimer({ startedAt }: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startedAt);

  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  const mm = String(Math.floor(elapsed / 60000)).padStart(2, '0');
  const ss = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0');

  return (
    <span
      aria-label={`${mm} minutes ${ss} seconds`}
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 6,
        color: '#f9c74f',
        letterSpacing: 1,
      }}
    >
      {mm}:{ss}
    </span>
  );
});
