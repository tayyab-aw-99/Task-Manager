# Task Manager App

A simple and responsive Task Manager web application built with **FastAPI**, **SQLite**, HTML, CSS, and JavaScript.

The application allows users to efficiently manage tasks with features like task creation, search, pagination, and task updates.

---

## Features

- Create new tasks
- View all tasks
- Edit and update tasks
- Delete tasks
- Search tasks
- Pagination support
- SQLite database integration
- Responsive user interface

---

## Tech Stack

**Backend**
- Python
- FastAPI
- SQLite

**Frontend**
- HTML
- CSS
- JavaScript

---

## Run Locally

### Clone Repository

```bash
git clone YOUR_REPOSITORY_URL
```

```bash
cd task-manager
```

---

### Create Virtual Environment

```bash
python -m venv venv
```

Activate environment:

**Windows**
```bash
venv\Scripts\activate
```

**Mac/Linux**
```bash
source venv/bin/activate
```

---

### Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Environment Setup

Create a `.env` file in the project root:

```env
DATABASE_URL=sqlite:///./task.db
```

---

### Run Application

Start FastAPI server:

```bash
uvicorn main:app --reload
```

Open:

```
http://127.0.0.1:8000
```

API Documentation:

```
http://127.0.0.1:8000/docs
```

---

## Project Structure

```
task-manager/
│
├── main.py
├── database.py
├── models.py
├── requirements.txt
├── .env
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
└── README.md
```

---

## Deployment

Live Demo:
(http://13.140.139.254:8003/)
