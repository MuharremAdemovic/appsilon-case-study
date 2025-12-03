# Appsilon Case Study

This project is a full-stack web application for managing employee records and analyzing camera logs using Machine Learning (YOLOv8).

## Project Structure

```
/backend
  └─ Appsilon.Api/       # .NET 8 Web API
  └─ database_schema.sql # Database Schema
/frontend
  └─ src/                # React + Vite Frontend
/ml
  └─ inference.py        # Python ML Script (YOLOv8)
/docs
  └─ system_design.md    # System Architecture & Documentation
docker-compose.yml       # Container Orchestration
```

## Prerequisites

- Docker & Docker Compose

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd appsilon-case-study
    ```

2.  **Start the application:**
    ```bash
    docker-compose up -d --build
    ```

3.  **Access the application:**
    - **Frontend:** [http://localhost:5173](http://localhost:5173)
    - **Backend API:** [http://localhost:5185/swagger](http://localhost:5185/swagger)

## Features

- **Employee Management:** CRUD operations for employee records.
- **Camera Log Analysis:**
    - Upload images for analysis.
    - Real-time progress feedback (Upload -> Analyze -> Success).
    - **Hybrid ML Approach:** Uses YOLOv8 for real object detection + simulated "diamond/substrate" labels for case study requirements.
    - View detailed JSON outputs in a modal.

## Documentation

For detailed system architecture, data flow, and future plans, please refer to [docs/system_design.md](docs/system_design.md).
