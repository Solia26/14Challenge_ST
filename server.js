// Import required modules
const express = require('express');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const sequelize = require('./config/connection'); // Adjust path as needed
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Import routes
const routes = require('./controllers');
const apiRoutes = require('./controllers/api');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure Handlebars as template engine
const hbs = exphbs.create({
  helpers: {
    format_date: (date) => {
      // Function to format date as 'Month Day, Year'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
});

// Setup session storage using Sequelize
const sess = {
  secret: process.env.SESSION_SECRET || 'super secret secret',
  cookie: { maxAge: 3600000 }, // Session timeout in milliseconds (1 hour)
  resave: false,
  saveUninitialized: true,
  store: new SequelizeStore({
    db: sequelize,
  }),
};

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sess));

// Set Handlebars as the view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Define routes
app.use('/', routes);
app.use('/api', apiRoutes);

// Sync Sequelize models to the database, then start the server
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
