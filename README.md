# NOTE

This project is being developed primarily with AI support. Any help with improving the code is welcome!

# NOTE #2

I don't promise that all functionalities, even those described in the readme, will work.

# Zed Stream Deck Integration

Control Zed editor from your Stream Deck!

## Quick Start

### 1. Start the server

```bash
cd zed-streamdeck-extension/src
node server.js
```

Server will run on `http://localhost:21422`

### 2. Build Stream Deck plugin (for development)

```bash
cd zed
npm install
npm run build
```

### 3. Watch mode (auto-rebuild on changes)

```bash
cd zed
npm run watch
```

## Installation

### First time setup:

```bash
# Install dependencies
cd zed
npm install

# Build plugin
npm run build

# Copy to Stream Deck
xcopy /E /Y com.lenerystia.zed.sdPlugin %APPDATA%\Elgato\StreamDeck\Plugins\
```

### Daily use:

1. Start server: `node zed-streamdeck-server.js`
2. Open Stream Deck
3. Use your Zed buttons!

## Available Actions

- `/window/new` - Open new Zed window
- `/terminal/toggle` - Toggle terminal
- `/navigate/file` - Open file picker (Ctrl+P)
- `/edit/save` - Save file
- `/edit/format` - Format document
- `/build` - Build project
- `/run` - Run project

## Troubleshooting

### Port already in use

```bash
# Find process
netstat -ano | findstr :21422

# Kill process (replace PID with actual number)
powershell -Command "Stop-Process -Id PID -Force"
```

### Stream Deck not detecting changes

1. Close Stream Deck
2. Rebuild: `npm run build`
3. Restart Stream Deck

## Development

### Project structure:

```
Stremdeck-zed/
├── zed-streamdeck-server.js    # HTTP server
├── zed/                         # Stream Deck plugin
│   ├── src/
│   │   ├── plugin.ts
│   │   └── actions/
│   │       └── zed-action.ts
│   └── com.lenerystia.zed.sdPlugin/
│       └── manifest.json
```

### Adding new actions:

1. Add endpoint to `zed-streamdeck-server.js`:

```javascript
case '/your/action':
  sendKeys('ctrl+shift+p');
  res.end(JSON.stringify({ status: 'ok' }));
  break;
```

2. Rebuild plugin: `npm run build`
3. Restart Stream Deck
