const fs = require('fs');
const path = require('path');

// Simple logger implementation
class Logger {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDir();
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  writeToFile(filename, message) {
    const filePath = path.join(this.logDir, filename);
    fs.appendFileSync(filePath, message + '\n');
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('info', message, meta);
    console.log(`\x1b[36m${formattedMessage}\x1b[0m`); // Cyan color
    this.writeToFile('combined.log', formattedMessage);
  }

  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('error', message, meta);
    console.error(`\x1b[31m${formattedMessage}\x1b[0m`); // Red color
    this.writeToFile('error.log', formattedMessage);
    this.writeToFile('combined.log', formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('warn', message, meta);
    console.warn(`\x1b[33m${formattedMessage}\x1b[0m`); // Yellow color
    this.writeToFile('combined.log', formattedMessage);
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      console.log(`\x1b[90m${formattedMessage}\x1b[0m`); // Gray color
      this.writeToFile('combined.log', formattedMessage);
    }
  }
}

const logger = new Logger();

module.exports = logger;
