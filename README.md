# Void Dungeon

A browser-based multiplayer roguelike RPG with real-time WebSocket communication and procedurally generated dungeons. No installation required for players - the game runs entirely in the browser.

<img width="1280" height="610" alt="image" src="https://github.com/user-attachments/assets/7aa5f702-5118-4552-9f0f-dd731b643c73" />


## Tech Stack

- **Frontend** - SvelteKit (TypeScript)
- **Backend** - Nest.js (TypeScript)
- **Database** - PostgreSQL
- **Real-time** - Socket.IO (WebSocket)
- **Infrastructure** - Docker, Docker Compose

## Project Structure

```
void-dungeon/
├── vd-frontend/           # SvelteKit client
│   └── src/
│       ├── lib/
│       │   ├── api/       # Backend communication services
│       │   ├── assets/    # Sprites, tiles, UI graphics
│       │   ├── class/     # Class definitions
│       │   ├── components/
│       │   └── store/     # Svelte state stores
│       └── routes/        # login, register, account, game
├── vd-backend/            # Nest.js server
│   └── src/
│       ├── auth/          # Authentication & authorization
│       ├── config/        # Database configuration
│       ├── game/          # Game logic, WebSocket gateway, engine
│       └── users/         # User & character management
├── docker-compose.dev.yml
├── docker-compose.prod.yml
└── .env.example
```

## Gameplay

### Overview

Void Dungeon combines MMORPG and roguelike elements. Players create characters, explore procedurally generated dungeons, fight enemies in a turn-based combat system, collect loot and upgrade their gear.

<img width="2551" height="1219" alt="image" src="https://github.com/user-attachments/assets/24d7d67c-ace3-465e-9367-f383b1ad7c86" />


### Character Classes

Each class levels up with a different stat focus:

| Class        | Focus                                |
| ------------ | ------------------------------------ |
| Blood Knight | Armor, health, attack                |
| Berserk      | Attack speed, crit chance            |
| Toxin Rogue  | Poison damage, evasion, crit         |
| Shadow Monk  | Mana, evasion, attack speed          |
| Battle Mage  | Mana, fire and cold elemental damage |

### Gameplay Loop

1. Start in the city hub - visit the Merchant (buy/sell items) and the Doctor (heal)
2. Enter the dungeon portal and choose a difficulty level (up to 15 levels, unlocked progressively)
3. Explore the procedurally generated dungeon - fight enemies, open chests, find loot
4. Each new dungeon floor grants a random skill (up to 5 per run, passive or active)
5. Defeat enemies for XP and item drops - level up to increase stats
6. Return to the city voluntarily or on death - all skills reset between runs

### Multiplayer

- See other online players in the city hub
- Send party invitations (up to 4 players)
- Party members explore the same dungeon instance together
- XP is shared; loot goes to the player who landed the kill
- Chest loot is competitive (not shared)
- Entering a dungeon together requires a party vote
- In-dungeon chat available

### Combat

Combat is turn-based and initiated by moving into an enemy. Each turn resolves in order:

1. Passive skills activate
2. Status effects are processed (poison deals damage, etc.)
3. Each side attacks based on their attack speed stat
4. Hits are calculated against evasion and accuracy
5. Status effects (Poison, Fire, Cold, Light, Void) are applied on hit based on chance

Active skills can be used outside of the attack turn - they cost mana but do not trigger a counterattack.

### Items

Items have five rarity tiers (Common to Legendary). Unwanted items can be sold for gold or dismantled for shards. Gold is used to buy items from the Merchant; shards are used to upgrade existing gear.

## Getting Started

### Prerequisites

- Docker 20.10.0+
- Docker Compose 2.0.0+

### Setup

Copy the example env file:

```bash
cp .env.example .env
```

For local development the default values in `.env.example` are sufficient. Key variables:

| Variable                                                      | Description                              |
| ------------------------------------------------------------- | ---------------------------------------- |
| `VITE_API_HOST`                                               | Backend API address used by the frontend |
| `VITE_SOCKET_HOST`                                            | WebSocket server address                 |
| `BACKEND_PORT`                                                | Backend port (default `3001`)            |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection                    |
| `JWT_SECRET`                                                  | Secret for signing JWT tokens            |
| `JWT_EXPIRATION`                                              | Token lifetime (default `5h`)            |

### Running in Development

Hot-reload is enabled in dev mode.

**Linux / macOS**

```bash
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d
```

**Windows** (Docker Desktop required)

```bash
docker-compose -f docker-compose.dev.yml build
docker-compose -f docker-compose.dev.yml up -d
```

Open [http://localhost:5173](http://localhost:5173)

### Running in Production

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Open [http://localhost:3000](http://localhost:3000)

The frontend defaults to port `3000` and the backend to port `3001`. Make sure these do not conflict on your host.
