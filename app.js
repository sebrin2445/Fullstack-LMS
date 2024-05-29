const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require('bcryptjs');
const app = express();
const mongoose = require("mongoose");
app.use(express.static("pulic"));



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
require('dotenv').config();

const PORT = 2008 || process.env.PORT;
const mongoDBURL = 'mongodb+srv://sebrinasemir2445:ZntiIyJgQDxA1vrx@cluster0.lz3n2ig.mongodb.net/loginnn';

// Connect to MongoDB Atlas
mongoose.connect(mongoDBURL)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => console.error('Error connecting to MongoDB Atlas:', err));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

const ADMIN_USERNAME = 'sebrin';
const ADMIN_PASSWORD = 'bla';

const userSchema = new mongoose.Schema({
  Fullname: String,
  section: String,
  usernameoremail: String,
  password: String,
  role: String // Add role field to the schema
});

const User = mongoose.model('User', userSchema);

app.get("/", function (req, res) {
    const name = "sebrina";
    res.render("index", { myname: name });
});

app.get("/signup.ejs", (req, res) => {
    res.render("signup.ejs");
});

app.post("/signup.ejs", async (req, res) => {
    try {
        const { Fullname, section, usernameoremail, password, role } = req.body;
        console.log('Signup request received:', req.body);

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Hashed Password:', hashedPassword);

        const newUser = new User({ Fullname, section, usernameoremail, password: hashedPassword, role });

        await newUser.save(); // Save user to the database
        console.log('User saved to the database:', newUser);

        res.render("login.ejs"); // Render login page after successful signup
    } catch (err) {
        console.error('Signup error:', err);
        res.send('Error: ' + err);
    }
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", async (req, res) => {
    try {
        const { usernameoremail, password } = req.body;
        console.log('Login attempt:', { usernameoremail, password });

        // Check if the entered credentials match the admin credentials
        if (usernameoremail === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            req.session.isAuthenticated = true;
            req.session.role = 'admin';
            // Redirect to admin page
            return res.render("admin", { admname: ADMIN_USERNAME });
        }

        const foundUser = await User.findOne({ usernameoremail });
        console.log('Found user:', foundUser);

        if (foundUser) {
            const isMatch = await bcrypt.compare(password, foundUser.password);
            console.log('Password match:', isMatch);

            if (isMatch) {
                req.session.isAuthenticated = true;
                req.session.role = foundUser.role;

                if (foundUser.role === 'student') {
                    return res.render("student", { stuname: usernameoremail });
                } else if (foundUser.role === 'teacher') {
                    return res.render("teacher", { teachername: usernameoremail });
                }
            } else {
                return res.send('Invalid username or password.');
            }
        } else {
            return res.send('User not found.');
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.send('Error: ' + err);
    }
});

app.get("/admin", (req, res) => {
    // Check if the user is authenticated as admin
    if (req.session.isAuthenticated && req.session.role === 'admin') {
        // Render admin page
        res.render("admin");
    } else {
        // If not authenticated as admin, redirect to login page
        res.redirect("/login");
    }
});

app.listen(PORT, () => {
    console.log("server started on 2008");
});
