# System Design Document - Appsilon Case Study

## 1. General System Flow
The system operates as a cohesive pipeline connecting the user interface to the backend, database, and machine learning components:

1.  **Frontend (React):** The user logs in with **Name and Password** and uploads an image via the web interface.
2.  **Backend (.NET API):** The API receives the image, saves it to the file system, and creates a "Pending" record in the **PostgreSQL** database.
3.  **ML Inference (Python):** The backend triggers a Python subprocess. This script loads the **YOLOv8** model, processes the image, and generates a JSON output containing detected objects (both real and simulated).
4.  **Database Update:** The backend captures the JSON output and updates the database record.
5.  **Frontend Display:** The UI polls or receives the updated data and displays the results to the user.

## 2. Why these technologies were chosen?
*   **React + Vite:** Chosen for its component-based architecture, fast development cycle, and excellent performance. Vite ensures rapid build times.
*   **.NET 8 Web API:** Selected for its robustness, type safety (C#), and high performance. It provides a solid foundation for enterprise-grade applications.
*   **Python + YOLOv8:** Python is the industry standard for ML. YOLOv8 was chosen for its state-of-the-art object detection speed and accuracy, making it ideal for real-time analysis.
*   **PostgreSQL:** A reliable, open-source relational database that handles structured data (employees) and JSON data (ML outputs) efficiently.
*   **Docker:** Ensures consistent environments across development and deployment, solving "it works on my machine" issues.

## 3. Security & Scalability (If this were a real project)
If this were a production-grade project, I would implement the following:

*   **Security:**
    *   **Authentication/Authorization:** Implement **JWT (JSON Web Tokens)** or OAuth2 to secure API endpoints.
    *   **Input Validation:** stricter validation on file types and sizes to prevent malicious uploads.
    *   **HTTPS:** Enforce SSL/TLS for all data in transit.
    *   **Secrets Management:** Use Vault or environment variables for sensitive keys instead of hardcoding.

*   **Scalability:**
    *   **Async Processing:** Decouple the ML inference from the HTTP request using a message queue (e.g., **RabbitMQ** or **Redis**). The API would push a job to the queue, and separate worker services would process images.
    *   **Cloud Storage:** Store images in **AWS S3** or **Azure Blob Storage** instead of the local file system.
    *   **Load Balancing:** Deploy multiple instances of the backend and ML services behind a load balancer (e.g., Nginx or Kubernetes Ingress).

## 4. Major Problems & Solutions
During development, several challenges were encountered:

*   **Problem:** Python script logs (e.g., YOLO loading bars) were polluting the standard output, causing JSON parsing errors in the backend.
    *   **Solution:** Implemented a `suppress_stdout` context manager in Python to redirect non-essential logs to `dev/null`, ensuring only the final JSON is printed to stdout. Additionally, the backend was updated to extract the JSON substring specifically.
*   **Problem:** Docker volume mapping issues caused the backend to not see the uploaded files or the ML script.
    *   **Solution:** Correctly configured `docker-compose.yml` volumes to share the `uploads` directory and the `ml` folder between the host and the container.
*   **Problem:** Frontend state management for the multi-step upload process (Upload -> Analyze).
    *   **Solution:** Refactored the `handleSubmit` function to be asynchronous and state-driven, providing clear visual feedback (emojis/messages) for each step of the process.

## 5. Next Development Steps
If more time were available, I would focus on:

1.  **Custom Model Training:** Collect a real dataset of "diamond" and "substrate" images, annotate them, and fine-tune the YOLOv8 model to replace the current hybrid/mock approach.
2.  **Automated Testing:** Write unit tests for the .NET backend (xUnit) and integration tests for the API endpoints.
3.  **CI/CD Pipeline:** Set up GitHub Actions to automatically build and test the project on every push.
4.  **User Roles:** Add Admin vs. Viewer roles to restrict who can delete logs or manage employees.

---

# Sistem Tasarım Dökümanı - Appsilon Case Study (Türkçe)

## 1. Genel Sistem Akışı
Sistem, kullanıcı arayüzünü backend, veritabanı ve makine öğrenimi bileşenlerine bağlayan bütünleşik bir boru hattı (pipeline) olarak çalışır:

1.  **Frontend (React):** Kullanıcı **İsim ve Şifre** ile giriş yapar ve web arayüzü üzerinden bir resim yükler.
2.  **Backend (.NET API):** API resmi alır, dosya sistemine kaydeder ve **PostgreSQL** veritabanında "Bekliyor" (Pending) durumunda bir kayıt oluşturur.
3.  **ML Çıkarımı (Python):** Backend bir Python alt süreci başlatır. Bu script **YOLOv8** modelini yükler, resmi işler ve tespit edilen nesneleri (hem gerçek hem simüle edilmiş) içeren bir JSON çıktısı üretir.
4.  **Veritabanı Güncellemesi:** Backend bu JSON çıktısını yakalar ve veritabanı kaydını günceller.
5.  **Frontend Gösterimi:** Arayüz güncellenen veriyi alır ve sonuçları kullanıcıya gösterir.

## 2. Neden bu teknolojileri seçtiniz?
*   **React + Vite:** Bileşen tabanlı mimarisi, hızlı geliştirme döngüsü ve mükemmel performansı için seçildi. Vite, çok hızlı derleme süreleri sunar.
*   **.NET 8 Web API:** Sağlamlığı, tip güvenliği (C#) ve yüksek performansı nedeniyle tercih edildi. Kurumsal seviyede uygulamalar için güçlü bir temel sağlar.
*   **Python + YOLOv8:** Python, ML dünyasının endüstri standardıdır. YOLOv8, gerçek zamanlı analiz için ideal olan hızı ve doğruluğu nedeniyle seçildi.
*   **PostgreSQL:** Hem yapısal verileri (çalışanlar) hem de JSON verilerini (ML çıktıları) verimli bir şekilde işleyebilen güvenilir, açık kaynaklı bir veritabanıdır.
*   **Docker:** "Benim bilgisayarımda çalışıyordu" sorununu ortadan kaldırarak geliştirme ve dağıtım ortamlarının tutarlı olmasını sağlar.

## 3. Güvenlik ve Ölçeklenebilirlik (Gerçek bir proje olsaydı)
Bu gerçek bir prodüksiyon projesi olsaydı, şunları uygulardım:

*   **Güvenlik:**
    *   **Kimlik Doğrulama/Yetkilendirme:** API uç noktalarını korumak için **JWT (JSON Web Tokens)** veya OAuth2 uygulanması.
    *   **Girdi Doğrulama:** Kötü amaçlı yüklemeleri önlemek için dosya türleri ve boyutları üzerinde daha sıkı kontroller.
    *   **HTTPS:** Tüm veri trafiğinin SSL/TLS ile şifrelenmesi.
    *   **Gizli Veri Yönetimi:** Hassas anahtarların kod içine gömülmesi yerine Vault veya ortam değişkenleri (env vars) ile yönetilmesi.

*   **Ölçeklenebilirlik:**
    *   **Asenkron İşleme:** ML çıkarımını HTTP isteğinden ayırarak bir mesaj kuyruğu (örn. **RabbitMQ** veya **Redis**) kullanmak. API işi kuyruğa atar, ayrı "worker" servisler resimleri işler.
    *   **Bulut Depolama:** Resimleri yerel disk yerine **AWS S3** veya **Azure Blob Storage** üzerinde tutmak.
    *   **Yük Dengeleme (Load Balancing):** Backend ve ML servislerinin birden fazla kopyasını (instance) bir yük dengeleyici (Nginx veya Kubernetes Ingress) arkasında çalıştırmak.

## 4. Karşılaşılan Problemler ve Çözümler
Geliştirme sürecinde bazı zorluklarla karşılaşıldı:

*   **Problem:** Python script logları (örn. YOLO yükleme çubukları) standart çıktıyı kirletiyor ve Backend'de JSON ayrıştırma hatalarına neden oluyordu.
    *   **Çözüm:** Python tarafında gereksiz logları `dev/null`a yönlendiren bir `suppress_stdout` bağlam yöneticisi (context manager) uygulandı. Ayrıca Backend tarafında sadece JSON formatına uyan metnin ayıklanması sağlandı.
*   **Problem:** Docker volume (disk alanı) eşleme sorunları nedeniyle Backend, yüklenen dosyaları veya ML scriptini göremiyordu.
    *   **Çözüm:** `docker-compose.yml` dosyasında `uploads` klasörü ve `ml` klasörü için doğru eşlemeler yapılarak host ve container arasındaki dosya paylaşımı düzeltildi.
*   **Problem:** Çok adımlı yükleme süreci (Yükle -> Analiz Et) için Frontend durum yönetimi.
    *   **Çözüm:** `handleSubmit` fonksiyonu asenkron ve durum tabanlı (state-driven) hale getirildi. Kullanıcıya her adımda (Yükleniyor, Analiz Ediliyor, Başarılı) net görsel geri bildirimler (emojiler/mesajlar) sunuldu.

## 5. Sonraki Geliştirme Adımları
Daha fazla vaktim olsaydı şunlara odaklanırdım:

1.  **Özel Model Eğitimi:** Gerçek "diamond" ve "substrate" resimlerinden oluşan bir veri seti toplamak, etiketlemek ve YOLOv8 modelini bu veri setiyle eğiterek (fine-tuning) mevcut hibrit yapıyı tamamen gerçek bir yapıya dönüştürmek.
2.  **Otomatik Testler:** .NET backend için birim testleri (xUnit) ve API uç noktaları için entegrasyon testleri yazmak.
3.  **CI/CD Hattı:** Her kod gönderiminde (push) projeyi otomatik olarak derleyen ve test eden GitHub Actions iş akışlarını kurmak.
4.  **Kullanıcı Rolleri:** Kayıtları kimin silebileceğini veya çalışanları kimin yönetebileceğini kısıtlamak için Admin ve İzleyici rolleri eklemek.
