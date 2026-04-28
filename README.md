# 🛡️ CorpGuard VMS – Visitor Management System

A **professional-grade Visitor Management System (VMS)** built using React Native (Expo) for managing secure and efficient visitor flow in corporate environments.  
The application handles the complete lifecycle of a visitor — from **pre-registration to secure exit verification**.

---

## 🚀 Tech Stack
- React Native (Expo)
- AsyncStorage (Persistent Local Storage)
- Expo Camera
- Expo Print
- React Native Signature Canvas

---

## 📱 Features

### 📊 Dashboard & State Management
- Centralized dashboard displaying visitor stats:
  - Pending
  - Inside
  - Signed
  - Exited
- Custom state-based routing system
- Persistent data handling using AsyncStorage

---

### 📝 Pre-Registration System
- Pre-book visitor entries with details:
  - Name, Phone, Company
  - Purpose, Department
  - Host Name

---

### 📸 Digital Check-In & Gatepass Generation
- Capture visitor photo using device camera
- Auto-generate **unique Gatepass ID**
- Generate downloadable **PDF Gatepass**
  - Built using custom HTML/CSS templates via Expo Print

---

### ✍️ Host Approval with Digital Signature
- Signature capture using WebView-based canvas
- Smooth UX with:
  - Scroll lock during signing
  - Auto-save signature data
- Enables secure host authorization

---

### 🔐 Secure Exit with OTP Verification
- 6-digit OTP-based exit validation
- Features:
  - Animated input fields
  - Error handling (shake animation)
  - Attempt limit for security
- Automatically updates visitor status on successful verification

---

### 📋 Advanced Visitor Management
- Searchable & filterable visitor list
- Custom status badges:
  - Pending / Inside / Approved / Exited

---

## ⚙️ Technical Highlights

- **State + Storage Sync:**  
  Ensured consistent UI updates with AsyncStorage persistence across reloads

- **Touch Conflict Handling:**  
  Resolved ScrollView vs Signature Pad gesture conflicts dynamically

- **Native Module Integration:**  
  Managed permissions and integration for Camera & Print APIs in Expo

- **Metro Bundler Debugging:**  
  Fixed case-sensitivity and entry-point issues causing invariant violations

---

## 🎯 Use Case
Ideal for:
- Corporate Offices
- Societies & Residential Complexes
- Institutions & Campuses
- Security Desk Automation

---

## 📌 Future Enhancements
- Cloud sync with backend (Firebase / Node.js)
- QR-based visitor entry
- Real-time notifications to hosts
- Admin analytics dashboard

---

## 👨‍💻 Author
**Ansh**  
Frontend Developer (React Native)

---

## 📸 App Screenshots

<p align="center">
  <img width="250"  alt="image" src="https://github.com/user-attachments/assets/8f324c9b-f38a-4176-afb8-c80e09f05565" />
  <img width="250"  alt="image" src="https://github.com/user-attachments/assets/fcbe3cf3-d0c2-4864-9df4-ad6698f79c72" />
  <img width="250"  alt="image" src="https://github.com/user-attachments/assets/aa16cd0d-5ffb-421d-94ea-278e3a90ddcd" />
</p>

<p align="center">
  <img width="250"  alt="image" src="https://github.com/user-attachments/assets/cb8a9dc9-b1aa-4289-95b4-c2b431acbbec" />
  <img width="250"  alt="image" src="https://github.com/user-attachments/assets/eaf1e1d8-c7c1-4cf8-aa82-ca146452d77f" />
  <img width="250"  alt="image" src="https://github.com/user-attachments/assets/8a91758d-2dc5-4117-96ce-bcdf8ed30f4c" />
</p>
