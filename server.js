const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage });

// Registration API
app.post('/api/register', upload.fields([
  { name: 'profile_pic', maxCount: 1 },
  { name: 'id_card', maxCount: 1 }
]), async (req, res) => {
  const { full_name, email, phone, college_name, college_id } = req.body;
  const profile_pic = req.files['profile_pic'][0].filename;
  const id_card = req.files['id_card'][0].filename;

  const password = crypto.randomBytes(4).toString('hex');
  const password_hash = await bcrypt.hash(password, 10);

  const sql = `INSERT INTO users (full_name, email, phone, college_name, college_id, profile_pic, id_card, password_hash)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.execute(sql, [full_name, email, phone, college_name, college_id, profile_pic, id_card, password_hash],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Database error' });
      }

      // Send email
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Test Portal Password',
        text: `Hello ${full_name},

Your registration is successful. Your password is: ${password}

Regards,
Exam Portal`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ message: 'Failed to send email' });
        }
        res.status(200).json({ message: 'Registration successful. Password sent to email.' });
      });
    });
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server running on port', process.env.PORT || 5000);
});
