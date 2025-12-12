# Pokémon Inventory Admin

A full-stack inventory management system designed for high-volume trading card collectors and stores. This application allows users to digitize their collection, manage physical storage locations (binders, boxes), and identify cards instantly using a webcam.

## 🚀 Key Features

* **Hybrid Card Scanner:** Identifies cards using a two-stage pipeline: Google Cloud Vision (OCR) for text candidate narrowing, followed by OpenCV (ORB Feature Matching) for precise visual re-ranking.
* **Warehouse Management:** Hierarchical storage system ( Warehouses -> Locations -> Cards) with capacity tracking.
* **Live Pricing:** Server-Sent Events (SSE) integration to sync real-time market prices for over 20,000 cards via TCGdex.
* **Virtual Sorting:** Custom Hibernate `@Formula` implementation allows sorting mixed datasets (manual prices vs. live market prices + markup) seamlessly.
* **Interactive Dashboard:** A React-based UI with dark mode, responsive grids, and live webcam integration.

## 🛠️ Tech Stack

### Backend
* **Framework:** Java Spring Boot 3
* **Database:** PostgreSQL (with Hibernate/JPA)
* **Computer Vision:** Google Cloud Vision API & OpenCV (Java wrappers)
* **Build Tool:** Maven

### Frontend
* **Framework:** React (Vite)
* **UI Library:** Material UI (MUI) v5
* **State Management:** React Hooks & Local State
* **HTTP Client:** Axios

## 📂 Project Structure

* `backend/` - Spring Boot REST API and Image Processing services.
* `frontend/` - React Single Page Application (SPA).
