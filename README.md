# 📄 DocParser — Document Intelligence Pipeline

A full-stack document parsing pipeline built with **React + Tailwind CSS** (frontend) and **FastAPI** (backend). Supports PDFs and scanned image documents.

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite |
| Styling | Tailwind CSS v3 |
| Backend | FastAPI (Python) |
| PDF Parsing | pdfplumber |
| OCR | Tesseract + pytesseract |
| Image Processing | Pillow |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Tesseract OCR installed on system

#### Install Tesseract:
```bash
# Ubuntu/Debian
sudo apt-get install tesseract-ocr

# macOS
brew install tesseract

# Windows
# Download from: https://github.com/UB-Mannheim/tesseract/wiki
```

---

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate      # Linux/Mac
# venv\Scripts\activate       # Windows

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

The API will be live at: http://localhost:8000

Swagger UI (interactive docs): http://localhost:8000/docs

---

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be live at: http://localhost:5173

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API root info |
| GET | `/health` | Health check |
| POST | `/parse` | Parse a single document |
| POST | `/parse/batch` | Parse multiple documents (max 10) |

### Example: Parse a Document

```bash
curl -X POST http://localhost:8000/parse \
  -F "file=@statement.pdf"
```

### Response Structure

```json
{
  "success": true,
  "filename": "statement.pdf",
  "file_size": 123456,
  "document_type": "pdf",
  "processing_time_seconds": 0.842,
  "extraction": {
    "pages": [...],
    "tables": [...],
    "metadata": {...},
    "word_count": 1234,
    "full_text": "..."
  },
  "entities": {
    "amounts": ["$1,500.00", "$250.00"],
    "dates": ["01/15/2024", "January 31, 2024"],
    "account_numbers": ["4111 1111 1111 1111"],
    "emails": ["user@example.com"]
  },
  "summary": {
    "total_pages": 3,
    "total_words": 1234,
    "tables_found": 2,
    "entities_found": 8
  }
}
```

---

## 🏗️ Project Structure

```
docparser/
├── backend/
│   ├── main.py              # FastAPI application
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx         # React entry point
        ├── App.jsx          # Root component
        ├── index.css        # Global styles + Tailwind
        └── components/
            ├── UploadZone.jsx    # Drag & drop file upload
            ├── ResultsPanel.jsx  # Parsed results display
            └── Sidebar.jsx       # Tech stack + API status
```

---

## 🎨 Features

- 📂 **Drag & Drop Upload** — PDF and image support (PNG, JPG, TIFF, BMP)
- 📖 **Full Text Extraction** — Page-by-page text with copy support
- 📊 **Table Detection** — Renders extracted tables interactively
- 🔍 **Entity Detection** — Amounts, dates, account numbers, emails
- 🌐 **OCR Support** — Tesseract-powered extraction for scanned docs
- 📈 **Confidence Score** — OCR accuracy percentage for scanned images
- ⚡ **FastAPI Backend** — Async, high-performance, auto-documented API
- 🎨 **Dark Terminal UI** — Tailwind CSS with custom design system

---

## 🔧 Configuration

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:8000
```

---

## 📝 License

MIT
