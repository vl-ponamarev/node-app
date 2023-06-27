const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();
const mongoose = require('mongoose');
const FileStore = require('session-file-store')(session);
const router = require('./routes/index');
const errorMiddleware = require('./middlewares/error-middleware');

require('dotenv').config();

const app = express();
const { PORT } = process.env;

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    name: 'sid',
    secret: process.env.SESSION_SECRET ?? 'test',
    resave: true,
    store: new FileStore(),
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 12,
      httpOnly: true
    }
  })
);

app.use('/api', router);
app.use('/api/post', router);
app.use(errorMiddleware);

const start = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    app.listen(PORT, () => console.log(`Server has started on PORT ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};
start();
