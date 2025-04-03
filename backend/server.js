require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const OpenAI = require("openai");
require("dotenv").config();



const { OAuth2Client } = require("google-auth-library");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(cors());


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "project",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err);
    } else {
        console.log("✅ Connected to MySQL Database");
    }
});

const GOOGLE_CLIENT_ID = "392040130989-fr1qk33s60n286b1c11cojvg9mifso1t.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Define your routes here...
app.post("/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email exists
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        // Insert user
        db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, password], (err) => {
            if (err) return res.status(500).json({ message: "Registration failed" });
            res.status(201).json({ message: "User registered successfully" });
        });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length === 0 || results[0].password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({ message: "Login successful", token: "fake-jwt-token" });
    });
});


// Google Auth Route
app.post("/auth/google", async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: GOOGLE_CLIENT_ID,
        });
        const { email, name } = ticket.getPayload();

        db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
            if (err) return res.status(500).json({ message: "Database error" });

            if (results.length === 0) {
                db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err) => {
                    if (err) return res.status(500).json({ message: "Database insert error" });
                });
            }

            res.json({ email, name, token });
        });
    } catch (error) {
        res.status(401).json({ message: "Invalid Google token" });
    }
});

// OpenAI API Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// API to Get News Summary
app.get("/api/getSummary", async (req, res) => {
  const { content } = req.query;
  if (!content) return res.status(400).json({ error: "Missing content" });

  try {
    // Check if summary exists in DB
    db.query("SELECT summary FROM news_summaries WHERE content = ?", [content], async (err, results) => {
      if (err) return res.status(500).json({ error: "Database error" });

      if (results.length > 0) {
        return res.json({ summary: results[0].summary });
      }

      // Generate summary using OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Summarize the given news article concisely in 2-3 sentences." },
          { role: "user", content }
        ],
        max_tokens: 100
      });

      const summary = response.choices[0].message.content.trim();

      // Save summary to DB
      db.query("INSERT INTO news_summaries (content, summary) VALUES (?, ?)", [content, summary]);

      res.json({ summary });
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: "Failed to generate summary" });
  }
});

// **Forgot Password API**
app.post("/forgot-password", (req, res) => {
    const { email } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (result.length === 0) {
            return res.status(400).json({ message: "Email not found" });
        }

        // Generate a reset token (valid for 1 hour)
        const token = jwt.sign({ email }, "secretKey", { expiresIn: "1h" });

        // Send email with the reset link
        const resetLink = `http://localhost:3000/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("❌ Error sending email:", error);
                return res.status(500).json({ message: "Error sending email" });
            }
            console.log("✅ Reset email sent:", info.response);
            res.json({ message: "Reset email sent! Check your inbox." });
        });
    });
});

// **Reset Password API**
app.post("/reset-password/:token", (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    jwt.verify(token, "secretKey", (err, decoded) => {
        if (err) return res.status(400).json({ message: "Invalid or expired token" });

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return res.status(500).json({ message: "Error hashing password" });

            db.query("UPDATE users SET password = ? WHERE email = ?", [hash, decoded.email], (err) => {
                if (err) return res.status(500).json({ message: "Database error" });

                res.json({ message: "Password successfully reset" });
            });
        });
    });
});

// **Submit Feedback API**
app.post("/submit-feedback", (req, res) => {
    const { email, feedback } = req.body;

    if (!email || !feedback) {
        return res.status(400).json({ message: "Email and feedback are required" });
    }

    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Error checking user" });

        if (results.length > 0) {
            const updateQuery = "UPDATE users SET feedback = ? WHERE email = ?";
            db.query(updateQuery, [feedback, email], (err) => {
                if (err) return res.status(500).json({ message: "Error updating feedback" });

                res.json({ message: "Feedback updated successfully!" });
            });
        } else {
            const insertQuery = "INSERT INTO users (email, feedback) VALUES (?, ?)";
            db.query(insertQuery, [email, feedback], (err) => {
                if (err) return res.status(500).json({ message: "Error saving feedback" });

                res.json({ message: "Feedback submitted successfully!" });
            });
        }
    });
});

// **Save Preferences API**
app.post("/save-preferences", (req, res) => {
    const { email, preferences } = req.body;

    if (!email || !preferences) {
        return res.status(400).json({ message: "Email and preferences are required" });
    }

    const checkUserQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkUserQuery, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length > 0) {
            const updateQuery = "UPDATE users SET preferences = ? WHERE email = ?";
            db.query(updateQuery, [preferences, email], (err) => {
                if (err) return res.status(500).json({ message: "Error updating preferences" });
                res.json({ success: true, message: "Preferences updated successfully!" });
            });
        } else {
            const insertQuery = "INSERT INTO users (email, preferences) VALUES (?, ?)";
            db.query(insertQuery, [email, preferences], (err) => {
                
                res.json({ success: true, message: "Preferences saved successfully!" });
            });
        }
    });
});

app.get("/get-preferences", (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const query = "SELECT preferences FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length > 0) {
            res.json({ preferences: results[0].preferences });
        } else {
            res.json({ preferences: "" }); // No preferences set yet
        }
    });
});


app.get("/user/email/:email", (req, res) => {
    const email = req.params.email;
    const sql = "SELECT name, email, color, shape, gradient, gradientColor1, gradientColor2 FROM users WHERE email = ?";
    
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length > 0) {
            res.json(results[0]); // Send first result with theme preferences
        } else {
            res.status(404).json({ error: "User not found" });
        }
    });
});



app.post("/update-user", (req, res) => {
    const { email, name, newEmail } = req.body;

    if (!email || !name || !newEmail) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const updateQuery = "UPDATE users SET name = ?, email = ? WHERE email = ?";
    db.query(updateQuery, [name, newEmail, email], (err, result) => {
        if (err) {
            console.error("Error updating user:", err);
            return res.status(500).json({ message: "Error updating user" });
        }

        if (result.affectedRows > 0) {
            res.json({ message: "User updated successfully!" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    });
});


// Update password API
app.post("/update-password", (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch the user's current password from the database
    const fetchUserQuery = "SELECT password FROM users WHERE email = ?";
    db.query(fetchUserQuery, [email], (err, results) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ message: "Error fetching user" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const hashedPassword = results[0].password;

        // Compare old password with the stored hash
        bcrypt.compare(oldPassword, hashedPassword, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ message: "Incorrect old password" });
            }

            // Hash the new password before storing
            bcrypt.hash(newPassword, 10, (err, hashedNewPassword) => {
                if (err) {
                    console.error("Error hashing password:", err);
                    return res.status(500).json({ message: "Error updating password" });
                }

                // Update the password in the database
                const updatePasswordQuery = "UPDATE users SET password = ? WHERE email = ?";
                db.query(updatePasswordQuery, [hashedNewPassword, email], (err, result) => {
                    if (err) {
                        console.error("Error updating password:", err);
                        return res.status(500).json({ message: "Error updating password" });
                    }

                    res.json({ message: "Password updated successfully!" });
                });
            });
        });
    });
});


// **Get User's Theme Preferences**
app.get("/get-theme/:email", (req, res) => {
    const email = req.params.email;

    db.query(
        "SELECT color, shape, gradient, gradientColor1, gradientColor2 FROM users WHERE email = ?", 
        [email], 
        (err, results) => {
            if (err) return res.status(500).json({ message: "Database error" });

            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json(results[0]); // Send user's saved theme data
        }
    );
});

// **Update User's Theme Preferences**
app.post("/save-theme", (req, res) => {
    let { email, color, shape, gradient, gradientColor1, gradientColor2 } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    // If no gradient, set gradient colors to NULL
    if (gradient === "none") {
        gradientColor1 = null;
        gradientColor2 = null;
    }

    db.query(
        "UPDATE users SET color = ?, shape = ?, gradient = ?, gradientColor1 = ?, gradientColor2 = ? WHERE email = ?",
        [color, shape, gradient, gradientColor1, gradientColor2, email],
        (err) => {
            if (err) {
                return res.status(500).json({ message: "Database error" });
            }
            res.json({ message: "Theme preferences updated successfully!" });
        }
    );
});



if (process.env.NODE_ENV !== "test") {
    app.listen(5000, () => {
        console.log("🚀 Server running on port 5000");
    });
}

module.exports = { app, db };
