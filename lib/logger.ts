import { createLogger, format, transports } from 'winston'

const { combine, timestamp, printf, colorize } = format

const logFormat = printf(({ level, message, timestamp }) => {
  return `[${timestamp}] ${level}: ${message}`
})

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new transports.Console({ format: combine(colorize(), timestamp(), logFormat) }),
    new transports.File({ filename: 'logs/app.log' }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
})

export default logger
