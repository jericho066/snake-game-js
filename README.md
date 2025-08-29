# 🐍 Snake Game

A modern, customizable Snake Game built with HTML, CSS, and JavaScript.

## Features

- Classic snake gameplay
- Multiple food types and power-ups
- Sound effects
- Light and dark mode
- Responsive design (works on desktop and mobile)
- Touch controls for mobile (swipe to move)
- Difficulty and board size settings
- Profile and high score tracking

## Improvements & Suggestions

- Add mobile support with responsive layout and touch/swipe controls
- Implement online leaderboards and multiplayer mode
- Add more power-ups and obstacles for advanced gameplay
- Improve graphics and animations for a modern look
- Add music settings for better user experience
- Create custom themes and color schemes
- Add pause/resume and restart functionality
- Optimize performance for smoother gameplay

## Demo

![alt text](<demo.gif>)

## Status

🚧 **This project is currently under development.**  
Features and gameplay may change as new updates are added.

## How to Play

- **Desktop only:** Use arrow keys or WASD to control the snake.
- Eat food to grow and increase your score.
- Avoid hitting the walls or your own tail.
- Special foods grant power-ups or penalties.

> **Note:** This project is designed for desktop browsers. Mobile controls and layout are not officially supported.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jericho066/snake-game-js.git
   cd snake-game/Snake Game JS
   ```

2. **Run locally:**
   - Open `src/frontend/index.html` in your browser
   - Or use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code

3. **Node.js backend for scores:**
   ```bash
   cd src/backend
   npm install
   node server.js
   ```

## Folder Structure

```
Snake Game JS/
├── src/
│   ├── backend/      # Node.js server and score data
│   └── frontend/     # Game HTML, JS, CSS, and assets
├── .vscode/          # Editor settings
├── .gitignore
├── README.md
```

## Credits

- Snake body sprites used in this project are from the [Arynelson/Snake-Game]
- Sound effects are from the [ndodanli/SnakeGame]
- Built with HTML5, CSS3, JavaScript

## License

[MIT](LICENSE)
