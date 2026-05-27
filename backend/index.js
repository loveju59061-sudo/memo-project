const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🗄️ DB 연결 세팅 (.env에 숨겨둔 주소 사용)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// 🚀 기본 접속 확인용
app.get("/", (req, res) => {
  res.send("🚀 메모장 백엔드 API가 정상 작동 중입니다!");
});

// 📝 1. 메모 불러오기 API
app.get("/api/notes/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const result = await pool.query("SELECT * FROM notes WHERE name = $1", [name]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ name, content: "" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 💾 2. 메모 저장/수정 API (💡 app.app.post 오타 수정 완료!)
app.post("/api/notes", async (req, res) => {
  try {
    const { name, content } = req.body;
    
    const result = await pool.query(
      `INSERT INTO notes (name, content) 
       VALUES ($1, $2) 
       ON CONFLICT (name) DO UPDATE SET content = EXCLUDED.content 
       RETURNING *`,
      [name, content]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`서버 실행 중: http://localhost:${port}`);
});