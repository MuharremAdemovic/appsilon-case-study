# System Design Document - Appsilon Case Study

## 1. Overview
This project is a full-stack web application designed to manage employee records and analyze camera logs using Machine Learning. It demonstrates a modern microservices-like architecture where the frontend, backend, database, and ML services interact seamlessly.

## 2. Architecture

The system follows a containerized architecture using Docker Compose.

### Components:

1.  **Frontend (React + Vite):**
    *   **Role:** Provides the user interface for managing employees and viewing camera logs.
    *   **Tech Stack:** React, TypeScript, Vite, Vanilla CSS (Custom Design System).
    *   **Features:**
        *   Employee Management (CRUD).
        *   Camera Log Upload & Visualization.
        *   Real-time progress feedback for ML analysis.
        *   Interactive "Details" modal for JSON outputs.

2.  **Backend (.NET 8 Web API):**
    *   **Role:** Acts as the central API gateway and business logic layer.
    *   **Tech Stack:** ASP.NET Core Web API, C#, Entity Framework Core.
    *   **Responsibilities:**
        *   RESTful API endpoints for Employees and CameraLogs.
        *   File management (image uploads).
        *   Orchestrating the ML analysis process (calling Python scripts).
        *   Data persistence via PostgreSQL.

3.  **ML Service (Python + YOLOv8):**
    *   **Role:** Performs object detection on uploaded images.
    *   **Tech Stack:** Python 3.12, Ultralytics YOLOv8, OpenCV.
    *   **Integration:** Executed as a subprocess by the Backend.
    *   **Logic:**
        *   Uses a pre-trained YOLOv8n model for general object detection.
        *   Injects domain-specific mock data ("diamond", "substrate") to meet case study requirements.
        *   Outputs clean JSON data for the backend to consume.

4.  **Database (PostgreSQL):**
    *   **Role:** Persistent storage for application data.
    *   **Tech Stack:** PostgreSQL 16.
    *   **Tables:** `Employees`, `CameraLogs`.

## 3. Data Flow

### Camera Log Analysis Flow:
1.  **Upload:** User selects an image on the Frontend -> POST `/api/CameraLogs/upload`.
2.  **Storage:** Backend saves the file to `wwwroot/uploads` and creates a database record with status "Pending".
3.  **Trigger:** Frontend receives "Uploaded" signal and requests analysis -> POST `/api/CameraLogs/{id}/analyze`.
4.  **Inference:**
    *   Backend launches `python3 inference.py {image_path}`.
    *   Python script suppresses logs, runs YOLOv8 inference, injects custom labels, and prints JSON to stdout.
5.  **Capture:** Backend captures the stdout, extracts the JSON part (sanitization), and updates the database record.
6.  **Display:** Frontend receives the updated log and displays the "Details" button and tooltips.

## 4. Database Schema

### Employees Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `Id` | UUID | Primary Key |
| `Name` | VARCHAR | Full Name |
| `Email` | VARCHAR | Generated Email |
| `Department` | VARCHAR | Department Name |
| `CreatedAt` | TIMESTAMP | Creation Date |

### CameraLogs Table
| Column | Type | Description |
| :--- | :--- | :--- |
| `Id` | UUID | Primary Key |
| `ImageUrl` | VARCHAR | Path to stored image |
| `ModelOutputJson` | JSONB/TEXT | Full ML output |
| `CreatedAt` | TIMESTAMP | Creation Date |

## 5. Future Work & Improvements

### Custom Model Training
Currently, the system uses a **Hybrid Approach**:
*   **Real:** YOLOv8 pre-trained model for general objects (person, car, etc.).
*   **Mock:** "Diamond" and "Substrate" labels are injected programmatically.

**Plan for Production:**
To achieve 100% real detection for domain-specific objects:
1.  **Data Collection:** Collect 100+ real images containing diamonds and substrates.
2.  **Annotation:** Label these images using tools like Roboflow or LabelImg.
3.  **Fine-tuning:** Train a custom YOLOv8 model on this dataset.
4.  **Deployment:** Replace the current `yolov8n.pt` with the custom-trained `best.pt` model and remove the mock injection logic in `inference.py`.

### Other Improvements
*   **Async Queue:** Move ML processing to a background queue (RabbitMQ/Redis) for high-load scalability.
*   **Authentication:** Implement JWT-based authentication for secure API access.

---

# Sistem Tasarım Dökümanı - Appsilon Case Study (Türkçe)

## 1. Genel Bakış
Bu proje, çalışan kayıtlarını yönetmek ve Makine Öğrenimi (ML) kullanarak kamera kayıtlarını analiz etmek için tasarlanmış tam kapsamlı (full-stack) bir web uygulamasıdır. Frontend, backend, veritabanı ve ML servislerinin sorunsuz bir şekilde etkileşime girdiği modern, mikroservis benzeri bir mimariyi sergiler.

## 2. Mimari

Sistem, Docker Compose kullanılarak konteynerize edilmiş bir mimari izler.

### Bileşenler:

1.  **Frontend (React + Vite):**
    *   **Rol:** Çalışanları yönetmek ve kamera kayıtlarını görüntülemek için kullanıcı arayüzü sağlar.
    *   **Teknoloji Yığını:** React, TypeScript, Vite, Vanilla CSS (Özel Tasarım Sistemi).
    *   **Özellikler:**
        *   Çalışan Yönetimi (Ekleme, Silme, Güncelleme, Listeleme).
        *   Kamera Kaydı Yükleme ve Görselleştirme.
        *   ML analizi için gerçek zamanlı ilerleme bildirimi.
        *   JSON çıktıları için etkileşimli "Detaylar" penceresi.

2.  **Backend (.NET 8 Web API):**
    *   **Rol:** Merkezi API ağ geçidi ve iş mantığı katmanı olarak görev yapar.
    *   **Teknoloji Yığını:** ASP.NET Core Web API, C#, Entity Framework Core.
    *   **Sorumluluklar:**
        *   Çalışanlar ve Kamera Kayıtları için RESTful API uç noktaları.
        *   Dosya yönetimi (resim yüklemeleri).
        *   ML analiz sürecini yönetme (Python scriptlerini çağırma).
        *   PostgreSQL üzerinden veri kalıcılığı.

3.  **ML Servisi (Python + YOLOv8):**
    *   **Rol:** Yüklenen resimler üzerinde nesne tespiti yapar.
    *   **Teknoloji Yığını:** Python 3.12, Ultralytics YOLOv8, OpenCV.
    *   **Entegrasyon:** Backend tarafından bir alt süreç (subprocess) olarak çalıştırılır.
    *   **Mantık:**
        *   Genel nesne tespiti için önceden eğitilmiş YOLOv8n modelini kullanır.
        *   Case study gereksinimlerini karşılamak için alana özgü sahte verileri ("diamond", "substrate") enjekte eder.
        *   Backend'in tüketmesi için temiz JSON verisi üretir.

4.  **Veritabanı (PostgreSQL):**
    *   **Rol:** Uygulama verileri için kalıcı depolama.
    *   **Teknoloji Yığını:** PostgreSQL 16.
    *   **Tablolar:** `Employees` (Çalışanlar), `CameraLogs` (Kamera Kayıtları).

## 3. Veri Akışı

### Kamera Kaydı Analiz Akışı:
1.  **Yükleme:** Kullanıcı Frontend üzerinden bir resim seçer -> POST `/api/CameraLogs/upload`.
2.  **Depolama:** Backend dosyayı `wwwroot/uploads` klasörüne kaydeder ve veritabanında durumu "Bekliyor" (Pending) olan bir kayıt oluşturur.
3.  **Tetikleme:** Frontend "Yüklendi" sinyalini alır ve analiz isteği gönderir -> POST `/api/CameraLogs/{id}/analyze`.
4.  **Çıkarım (Inference):**
    *   Backend `python3 inference.py {resim_yolu}` komutunu çalıştırır.
    *   Python scripti logları gizler, YOLOv8 çıkarımını çalıştırır, özel etiketleri ekler ve JSON çıktısını ekrana basar.
5.  **Yakalama:** Backend ekran çıktısını (stdout) yakalar, JSON kısmını ayıklar (temizleme) ve veritabanı kaydını günceller.
6.  **Görüntüleme:** Frontend güncellenen kaydı alır ve "Detaylar" butonu ile tooltip'leri görüntüler.

## 4. Veritabanı Şeması

### Employees (Çalışanlar) Tablosu
| Sütun | Tip | Açıklama |
| :--- | :--- | :--- |
| `Id` | UUID | Birincil Anahtar |
| `Name` | VARCHAR | Ad Soyad |
| `Email` | VARCHAR | Oluşturulan E-posta |
| `Department` | VARCHAR | Departman Adı |
| `CreatedAt` | TIMESTAMP | Oluşturulma Tarihi |

### CameraLogs (Kamera Kayıtları) Tablosu
| Sütun | Tip | Açıklama |
| :--- | :--- | :--- |
| `Id` | UUID | Birincil Anahtar |
| `ImageUrl` | VARCHAR | Kaydedilen resmin yolu |
| `ModelOutputJson` | JSONB/TEXT | Tam ML çıktısı |
| `CreatedAt` | TIMESTAMP | Oluşturulma Tarihi |

## 5. Gelecek Planları ve İyileştirmeler

### Özel Model Eğitimi (Custom Model Training)
Şu anda sistem **Hibrit Bir Yaklaşım** kullanmaktadır:
*   **Gerçek:** Genel nesneler (insan, araba vb.) için YOLOv8 ön eğitimli modeli.
*   **Simülasyon:** "Diamond" ve "Substrate" etiketleri programatik olarak eklenmektedir.

**Üretim Ortamı (Production) Planı:**
Alana özgü nesneler için %100 gerçek tespit sağlamak amacıyla:
1.  **Veri Toplama:** İçinde elmas ve katman (substrate) bulunan 100+ gerçek resim toplanacak.
2.  **Etiketleme:** Bu resimler Roboflow veya LabelImg gibi araçlarla etiketlenecek.
3.  **İnce Ayar (Fine-tuning):** Bu veri seti üzerinde özel bir YOLOv8 modeli eğitilecek.
4.  **Dağıtım:** Mevcut `yolov8n.pt` modeli, özel eğitilmiş `best.pt` modeli ile değiştirilecek ve `inference.py` içindeki sahte veri ekleme mantığı kaldırılacak.

### Diğer İyileştirmeler
*   **Asenkron Kuyruk:** Yüksek yük altında ölçeklenebilirlik için ML işlemlerini bir arka plan kuyruğuna (RabbitMQ/Redis) taşımak.
*   **Kimlik Doğrulama:** Güvenli API erişimi için JWT tabanlı kimlik doğrulama uygulamak.
