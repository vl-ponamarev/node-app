const path = require('path')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const session = require('express-session')
require('dotenv').config()
const mongoose = require('mongoose')
const FileStore = require('session-file-store')(session)
const router = require('./routes/index')
const errorMiddleware = require('./middlewares/error-middleware')

const required = ['DB_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET', 'UPLOAD_URL']
const missing = required.filter(name => !process.env[name])
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}`)
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 4000
const SESSION_PATH = process.env.SESSION_PATH || path.join(__dirname, 'sessions')

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || true,
  }),
)
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: true,
    store: new FileStore({
      path: SESSION_PATH,
    }),
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 12,
      httpOnly: true,
    },
  }),
);

app.use('/api', router)
app.use(errorMiddleware)

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    app.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`))
  } catch (e) {
    console.error(e);
  }
}

if (require.main === module) {
  start()
}

module.exports = { app, start }
