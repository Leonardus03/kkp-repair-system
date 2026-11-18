import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../config/db.js";
dotenv.config();

export async function register(req, res) {
  const { full_name, username, password, role, shift } = req.body;
  const validRoles = [
    "pic_area",
    "mp_repair",
    "qc",
    "admin",
    "section_head",
    "leader",
  ];

  if (!full_name || !username || !password || !role) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: "Role tidak valid" });
  }
  const needsShift = ["mp_repair", "pic_area"].includes(role);
  if (needsShift && !["A", "B"].includes(shift)) {
    return res
      .status(400)
      .json({
        message:
          "Untuk role pic_area/mp_repair, shift wajib diisi ('A' atau 'B')",
      });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (full_name, username, password_hash, role, shift)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, username, role, shift`,
      [full_name, username, hash, role, needsShift ? shift : null],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ message: "Username sudah dipakai" });
    }
    console.error(err);
    res.status(500).json({ message: "Gagal membuat user" });
  }
}

export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan password wajib diisi" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const user = result.rows[0];
    if (!user)
      return res.status(401).json({ message: "Username atau password salah" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: "Username atau password salah" });

    const token = jwt.sign(
      { id: user.id, role: user.role, full_name: user.full_name },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        role: user.role,
        username: user.username,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal login" });
  }
}
