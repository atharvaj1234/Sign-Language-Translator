const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const app = express();
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com' 
      : ['http://localhost:5173', 'http://localhost:4173'],
    credentials: true
  }));
  app.use(express.json());
const PORT = 5555;
const JWT_SECRET = 'your-secret-key-here'; // Replace with a secure secret key

// Middleware for parsing JSON
app.use(bodyParser.json());


// Database setup
const db = new sqlite3.Database('./app.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
    } else {
      console.log('Connected to the database.');
      createTables();
    }
  });
  
  function createTables() {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fullName TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          resetToken TEXT,
          resetTokenExpiry INTEGER
      )
    `, (err) => {
        if(err) {
            console.error('Error creating users table:', err.message)
        } else {
            console.log('Users table created or already exists')
            seedDatabase();
        }
    })
  }

async function seedDatabase() {
    db.get("SELECT COUNT(*) AS count FROM users", (err, row) => {
        if (err) {
            console.error('Error checking users table:', err.message);
            return;
        }
        if (row.count === 0) {
            const hashedPassword = bcrypt.hashSync('password123', 10)
            const dummyUser = {
                fullName: 'Dummy User',
                email: 'dummy@example.com',
                password: hashedPassword
            };

            db.run(`INSERT INTO users (fullName, email, password) VALUES (?, ?, ?)`, [dummyUser.fullName, dummyUser.email, dummyUser.password], (err) => {
                if (err) {
                   console.error('Error seeding the user:', err.message);
                } else {
                    console.log('Database seeded with a dummy user')
                }
            })
        } else {
            console.log('Database already seeded, no changes required')
        }
    })
}

  
// Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.sendStatus(401);
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  }


// Authentication Routes

// server.js - modify login and register routes

// Login route
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if(err) {
           return res.status(500).json({ message: 'Internal Server Error' });
        }
        if(!user){
            return res.status(401).json({ message: 'Incorrect credentials'})
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            return res.status(401).json({ message: 'Incorrect credentials'})
        }

        const token = jwt.sign({ id: user.id, email: user.email}, JWT_SECRET, {expiresIn: '1h'})
        // Return user data along with token
        res.json({ 
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName
            }
        });
    })
});

// Register route
app.post('/api/auth/register', async (req, res) => {
    const { fullName, email, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run('INSERT INTO users (fullName, email, password) VALUES (?,?,?)', [fullName, email, hashedPassword], function(err) {
        if (err) {
            if (err.errno === 19) {
               return res.status(400).json({ message: 'User with this email already exists'});
            }
            return res.status(500).json({ message: 'Internal server error'});
        }
        const token = jwt.sign({ id: this.lastID, email}, JWT_SECRET, {expiresIn: '1h'})
        // Return user data along with token
        res.json({ 
            token,
            user: {
                id: this.lastID,
                email,
                fullName
            }
        });
    });
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    crypto.randomBytes(20, (err, buffer) => {
        if (err) {
            return res.status(500).json({ message: 'Internal server error'});
        }

        const token = buffer.toString('hex');
        const now = Date.now();
        const expiryTime = now + 3600000; // 1 Hour

        db.run(`UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE email = ?`, [token, expiryTime, email], function(err){
           if(err){
              return res.status(500).json({ message: 'Internal server error'});
           }
           if(this.changes === 0) {
            return res.status(404).json({ message: 'User not found'});
           }
           // TODO: Send the email with the token link here
           res.json({ message: 'Password reset email sent'});
        });
    });
});

app.post('/api/auth/reset-password', async(req, res) => {
    const { token, password } = req.body;

    db.get('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?', [token, Date.now()], async (err, user) => {
      if(err) {
        return res.status(500).json({ message: 'Internal Server error'});
      }
      if(!user) {
        return res.status(400).json({ message: 'Invalid or expired token'})
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?', [hashedPassword, user.id], (err) => {
         if (err){
           return res.status(500).json({ message: 'Internal server error'});
         }
         res.json({ message: 'Password reset successful'});
      });
    });
});


// User Routes
app.get('/api/user', authenticateToken, (req, res) => {
    db.get('SELECT id, fullName, email FROM users WHERE id = ?', [req.user.id], (err, row) => {
        if (err) {
           return res.status(500).json({ message: 'Internal server error'});
        }
        if (!row) {
            return res.status(404).json({ message: 'User not found'});
        }

        res.json(row);
    })
});


app.put('/api/user', authenticateToken, async(req, res) => {
  const { fullName, email } = req.body;
  
  // Build the update query dynamically
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    
    if (fullName) {
      updateQuery += 'fullName = ?, ';
      updateValues.push(fullName);
    }
    if (email) {
        updateQuery += 'email = ?, ';
        updateValues.push(email);
    }
    
    // Remove trailing comma and space if there are updates
    if (updateValues.length > 0) {
        updateQuery = updateQuery.slice(0, -2); // Remove ", "
        updateQuery += ' WHERE id = ?';
    }
    else {
        return res.status(400).json({message: "No fields to update"})
    }


    db.run(updateQuery, [...updateValues, req.user.id], function(err) {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (this.changes === 0){
           return res.status(404).json({ message: 'User not found'});
        }
        res.json({ message: 'User updated successfully' });
    })
});


// Password Update Route
app.put('/api/user/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
  }
  
  db.get('SELECT password FROM users WHERE id = ?', [req.user.id], async (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!row) {
      return res.status(404).json({ message: 'User not found' });
    }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, row.password)
        if (!isPasswordValid){
            return res.status(401).json({ message: "Invalid Current Password"});
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

    db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id], function(err) {
      if (err) {
        return res.status(500).json({ message: 'Internal server error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'Password updated successfully' });
    });
  });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});