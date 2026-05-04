import { v4 as uuid } from 'uuid';
import { addGame } from './store';

export function seedGames(): void {
  const games = [
    { name: 'Catan', estimatedMinutes: 90, category: 'Strategy', minPlayers: 3, maxPlayers: 4 },
    { name: 'Codenames', estimatedMinutes: 30, category: 'Party', minPlayers: 4, maxPlayers: 8 },
    { name: 'Ticket to Ride', estimatedMinutes: 75, category: 'Strategy', minPlayers: 2, maxPlayers: 5 },
    { name: 'Pandemic', estimatedMinutes: 60, category: 'Cooperative', minPlayers: 2, maxPlayers: 4 },
    { name: 'Dixit', estimatedMinutes: 45, category: 'Party', minPlayers: 3, maxPlayers: 6 },
    { name: 'Azul', estimatedMinutes: 45, category: 'Strategy', minPlayers: 2, maxPlayers: 4 },
    { name: 'Coup', estimatedMinutes: 20, category: 'Party', minPlayers: 2, maxPlayers: 6 },
    { name: '7 Wonders', estimatedMinutes: 60, category: 'Strategy', minPlayers: 2, maxPlayers: 7 },
    { name: 'Wavelength', estimatedMinutes: 30, category: 'Party', minPlayers: 2, maxPlayers: 12 },
    { name: 'Just One', estimatedMinutes: 25, category: 'Cooperative', minPlayers: 3, maxPlayers: 7 },
  ];

  for (const g of games) {
    addGame({
      id: uuid(),
      addedBy: 'system',
      addedAt: Date.now(),
      ...g,
    });
  }
}
