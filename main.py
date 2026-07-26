import database

from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")


# ==========================
# HOME PAGE
# ==========================
@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html"
    )


# ==========================
# ADD TASK
# ==========================
@app.post("/tasks")
def add_task(title: str = Form(...)):
    try:
        database.cursor.execute(
            "INSERT INTO tasks(title) VALUES(?)",
            (title,)
        )

        database.conn.commit()

        return JSONResponse(
            status_code=200,
            content={"message": "Task Added Successfully"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error: {str(e)}"}
        )


# ==========================
# GET ALL TASKS
# ==========================
@app.get("/tasks")
def get_tasks(skip: int = 0, limit: int = 5):

    database.cursor.execute("SELECT COUNT(*) FROM tasks")
    total_tasks = database.cursor.fetchone()[0]

    database.cursor.execute(
        "SELECT * FROM tasks LIMIT ? OFFSET ?",
        (limit, skip)
    )

    rows = database.cursor.fetchall()

    tasks = []

    for row in rows:
        created_date = row[3] if len(row) > 3 else None
        if created_date is None:
            from datetime import datetime
            created_date = datetime.now().isoformat()

        tasks.append({
            "id": row[0],
            "title": row[1],
            "completed": bool(row[2]),
            "created_date": created_date
        })

    return {
        "tasks": tasks,
        "total": total_tasks,
        "skip": skip,
        "limit": limit
    }


# ==========================
# DELETE TASK
# ==========================
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    try:
        database.cursor.execute(
            "DELETE FROM tasks WHERE id = ?",
            (task_id,)
        )

        database.conn.commit()

        return JSONResponse(
            status_code=200,
            content={"message": "Task Deleted Successfully"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error: {str(e)}"}
        )


# ==========================
# UPDATE TASK
# ==========================
@app.put("/tasks/{task_id}")
def update_task(task_id: int, title: str = Form(...)):
    try:
        database.cursor.execute(
            "UPDATE tasks SET title = ? WHERE id = ?",
            (title, task_id)
        )

        database.conn.commit()

        return JSONResponse(
            status_code=200,
            content={"message": "Task Updated Successfully"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error: {str(e)}"}
        )


# ==========================
# COMPLETE / UNDO TASK
# ==========================
@app.patch("/tasks/{task_id}")
def toggle_task(task_id: int):
    try:
        database.cursor.execute(
            "SELECT completed FROM tasks WHERE id = ?",
            (task_id,)
        )

        task = database.cursor.fetchone()

        if task is None:
            return JSONResponse(
                status_code=404,
                content={"message": "Task Not Found"}
            )

        new_status = 0 if task[0] == 1 else 1

        database.cursor.execute(
            "UPDATE tasks SET completed = ? WHERE id = ?",
            (new_status, task_id)
        )

        database.conn.commit()

        return JSONResponse(
            status_code=200,
            content={"message": "Task Updated Successfully"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"message": f"Error: {str(e)}"}
        )