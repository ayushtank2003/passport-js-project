const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables from .env file

const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

// Middleware to parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware for session management
app.use(session({
    secret: "long12fzxv",  // Secret for session encryption
    resave: false,         // Do not save session if unmodified
    saveUninitialized: false  // Do not create a session until something is stored
}));

// Initialize Passport and use sessions for authentication
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB using environment variables for credentials
const DB_URL = process.env.DB_URL.replace("<password>", process.env.DB_PASSWORD);
mongoose.connect(DB_URL);

// Define the User schema and add passport-local-mongoose for authentication
const userSchema = new mongoose.Schema({
    email: String,       // User's email
    password: String     // User's password (hashed)
});

userSchema.plugin(passportLocalMongoose);  // Add methods for user authentication

const User = mongoose.model("User", userSchema);  // Create a User model

// Configure Passport.js to use the User model
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());  // Serialize user for session
passport.deserializeUser(User.deserializeUser());  // Deserialize user from session

// Route for the homepage
app.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        // If user is authenticated, send a message indicating they are already logged in
        res.send("You have already logged in. No need to login again.");
    } else {
        // If not authenticated, serve the index.html file
        res.sendFile(__dirname + "/index.html");
    }
});

// Route for the login page
app.get("/login", (req, res) => {
    if (req.isAuthenticated()) {
        // If user is authenticated, send a message indicating they are already logged in
        res.send("You have already logged in. No need to login again.");
    } else {
        // If not authenticated, serve the index.html file
        res.sendFile(__dirname + "/index.html");
    }
});

// Route to handle user registration
app.post("/register", (req, res) => {
    console.log(req.body);
    const email = req.body.username;  // Get email from request body
    const password = req.body.password;  // Get password from request body

    // Register the new user with the email and password
    User.register({ username: email }, password, (err, user) => {
        if (err) {
            console.log(err);
            res.redirect("/register");  // Redirect to register page if error occurs
        } else {
            // Authenticate the user and log them in
            passport.authenticate('local')(req, res, () => {
                res.send("Successfully registered and logged in!");
            });
        }
    });
});

// Route to handle user login
app.post("/login", (req, res) => {
    console.log(req.body);

    // Create a new user instance with the provided username and password
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    // Attempt to log in the user
    req.login(user, (err) => {
        if (err) {
            console.log(err);
            res.redirect("/login");  // Redirect to login page if error occurs
        } else {
            // Authenticate the user and establish a session
            passport.authenticate("local")(req, res, () => {
                res.send("Login successful!");
            });
        }
    });
});

// Start the server and listen on port 8080
const port = 8080;
app.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});
