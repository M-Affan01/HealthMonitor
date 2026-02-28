<div align="center">
  <h1>HealthPulse-Central (CIS Hackathon Project)</h1>

  **Smart Remote Health Monitoring System (Advanced 3-Day Version)**

  [![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-6.11-2D3748?logo=prisma)](https://www.prisma.io/)
  [![MongoDB Atlas](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)
  [![Deployed on Netlify](https://img.shields.io/badge/Deployed_on-Netlify-00C7B7?logo=netlify)](https://netlify.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## Project Overview (Academic/Real-World Context)

**HealthPulse-Central** is an enterprise-grade, web-based remote health monitoring system conceived for the **CIS Hackathon (Advanced 3-Day Version)**. 

### Problem Statement
Healthcare providers require centralized, real-time access to patient health data to enable effective remote monitoring, early detection of high-risk individuals, and quick intervention. Disconnected systems and manual tracking often lead to delayed medical responses.

### Proposed Solution
A centralized monitoring dashboard deployed on a secure cloud infrastructure (Netlify/AWS/GCP). The system empowers doctors and medical administrators to seamlessly monitor patient vitals, analyze 7-day health trends, calculate automated risk scores, and receive immediate alerts when biometric thresholds are exceeded. *(Note: For the scope of this hackathon, IoT integration is not required; vitals are manually logged for demonstration purposes.)*

## Detailed Feature Breakdown

### Core System & Logic
*   **Role-Based Access Control (RBAC):** Secure, scalable JWT authentication using `next-auth`, dividing access between `Doctor` and `Admin` roles.
*   **Patient Profile Management:** Fully digital health records supporting comprehensive medical histories, active allergies, and emergency contact associations.
*   **Risk Score Calculation:** A formula-based logic engine that computes a patient's overall health vulnerability by measuring real-time deviations from standard biometric baselines (e.g., Blood Pressure, Heart Rate).

### Advanced Analytics & UX
*   **Interactive Analytics Dashboard:** A centralized clinical overview summarizing total patients, critical alerts, and system-wide telemetry.
*   **7-Day Vitals Trend Graphs:** Dynamic, responsive charting utilizing `Recharts` to visualize a patient's historical health data over the past week.
*   **Threshold-based Alerting Engine:** Automated warning triggers when recorded vitals (Temperature, SpO2, Heart Rate) cross predefined safe physiological limits.
*   **Adaptive Dark/Light Mode:** Seamless theme switching for optimal clinical viewing in diverse lighting environments, powered by `next-themes` and `Tailwind CSS`.

### Reporting & Export
*   **Comprehensive PDF Exports:** Automated generation of detailed individual patient health histories and current vitals using `jsPDF`.
*   **Global Telemetry CSV Export:** Dashboard-level export functionality allowing administrators to download system-wide CSV ledgers of 7-day vitals trends.

## Architecture & Design Summary

### System Flow & Components
HealthPulse-Central is designed around a modern, serverless **Jamstack architecture**:
1.  **Frontend State & UX:** Built with React Server Components in Next.js. Client-side state (like modal toggles and real-time form handling) is managed via `Zustand` and `React Hook Form`.
2.  **API & Middleware:** Next.js App Router API routes (`/api/auth`, `/api/patients`, `/api/reports`) act as a lightweight Node.js/Express-style backend to handle RESTful operations and JWT session validation.
3.  **Data Persistence:** `Prisma ORM` serves as a strongly-typed bridge to a cloud-hosted **MongoDB Atlas** database, ensuring rigorous schema enforcement (Patient, Vitals, Alerts, Users).
4.  **Workflow Interaction:** 
    *   *State 1:* User authenticates -> Redirected to clinical Dashboard.
    *   *State 2:* Dashboard fetches clustered data (total patients, active alerts).
    *   *State 3:* Doctor selects a patient -> System routes to detailed profile fetching specific vitals sub-documents.
    *   *State 4:* Vitals entered -> System re-evaluates risk score -> Generates Alert if threshold breached.

## Technical Stack & Tools

*   **Frontend Ecosystem:** 
    *   Next.js (v15.2.3) - React hooks and server rendering
    *   Tailwind CSS (v4.0) - Utility-first styling
    *   shadcn/ui & Radix UI - Accessible component primitives
    *   Recharts - Data visualization
*   **Backend & APIs:** 
    *   Node.js runtime via Next.js serverless functions
    *   NextAuth.js (v4.24) - JWT-based Custom Credentials Authentication
*   **Database & ORM:** 
    *   MongoDB Atlas (Cloud Database)
    *   Prisma ORM (v6.11.1) - Schema modeling & migrations
*   **Additional Utilities:** 
    *   jsPDF / jsPDF-AutoTable - Client-side PDF generation
    *   Zod - Strict schema validation for API payloads
*   **Cloud Deployment:** 
    *   Netlify (Current Live Deployment Environment)

## Quick Start & Installation

### Prerequisites
*   Node.js (v20+ recommended)
*   Git CLI
*   A Free MongoDB Atlas Cluster (or a local MongoDB instance)

### Local Development Setup
1.  **Clone the repository**
    ```bash
    git clone https://github.com/M-Affan01/HealthMonitor.git
    cd HealthMonitor
    ```

2.  **Install project dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a root `.env` file and populate it with your specific credentials:
    ```env
    # MongoDB Connection String
    DATABASE_URL="mongodb+srv://<username>:<password>@cluster.mongodb.net/health_db"
    
    # NextAuth Configuration
    NEXTAUTH_SECRET="your_random_secret_string"
    NEXTAUTH_URL="http://localhost:3000"
    
    # JWT Encryption
    JWT_SECRET="your_jwt_signing_secret"
    ```

4.  **Initialize the Prisma Database Schema**
    Generate the local Prisma client and push the schema to MongoDB:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Start the Local Server**
    ```bash
    npm run dev
    ```
    Launch the app by navigating to `http://localhost:3000`.

## Usage Guide & Examples

1.  **Authentication:** 
    *   Start by registering a new medical provider account, or use existing seed credentials if available.
2.  **Dashboard Navigation:** 
    *   Upon login, the dashboard presents a high-level summary. Here you can view active threshold alerts that require immediate attention.
3.  **Patient Registration:** 
    *   Click near the patient list to register a new profile. Input multiple items for "Medical History" and "Allergies" by entering them separated by commas.
4.  **Logging Biometrics (Usage Example):** 
    *   Navigate to a patient's specific card. Click **"Log Biometrics"**.
    *   *Example input:* Heart Rate: `115`, Blood Pressure: `140/90`.
    *   *Result:* The system will instantly log the vitals, recalculate the risk score, and subsequently trigger a High-Risk Alert on the main dashboard due to elevated readings.
5.  **Data Export:**
    *   Use the **"Export Analysis"** button on any patient profile to instantly download a formatted PDF clinical report of their history and 7-day trend.

## Project Structure Tree

```text
HealthMonitor/
├── prisma/                 # Database structure
│   └── schema.prisma       # MongoDB Model definitions (User, Patient, Vitals)
├── public/                 # Static assets (icons, SVGs)
├── src/
│   ├── app/                # Next.js 15 App Router routing logic
│   │   ├── api/            # Serverless backend routes (/auth, /patients)
│   │   ├── dashboard/      # Main authenticated clinical interface
│   │   ├── login/          # Custom auth screens
│   │   └── globals.css     # Tailwind root styles
│   ├── components/         # Modular UI components
│   │   └── ui/             # shadcn/ui generic buttons, cards, dialogs
│   └── lib/                # Core utilities
│       ├── auth.ts         # JWT manipulation and password hashing
│       ├── db.ts           # Global Prisma client instantiation
│       └── pdf.ts          # jsPDF layout structures
├── netlify.toml            # Deployment pipeline settings
├── next.config.ts          # Next.js bundler config
├── package.json            # Scripts & Dependency mapping
└── tailwind.config.ts      # CSS themes and custom colors
```

## Performance & Optimization
*   **Static Generation:** Heavy use of Next.js server components combined with client-side interactivity limits massive JavaScript payloads.
*   **Prisma Client Caching:** Database connections are cached globally in development mode to prevent connection exhaustion.
*   **Serverless Edge Functions:** API routes are configured to run as high-performance Netlify Serverless Functions, ensuring instant response times across requests.

## Contributing Guidelines
We welcome contributions to strengthen our telemedicine capabilities!
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes following semantic commit messages (`git commit -m 'feat: Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request describing your clinical or technical enhancement.

## Future Plans
*   **IoT & Wearables Integration:** Enable automatic, continuous data syncing from external wearable devices (e.g., Apple Watch, Fitbit) to replace manual biometric logging.
*   **Predictive AI Modeling:** Integrate machine learning endpoints to forecast patient risk trajectories based on long-term historical vitals.
*   **Dedicated Patient Portal:** Create a secure, read-only interface mapped for patients to privately monitor their own health progress.

## License

This project is open-source and distributed under the **[MIT License](https://opensource.org/licenses/MIT)**. 

### What this means:
*   **Commercial Use:** You may use this software for commercial purposes.
*   **Modification:** You may modify the software and use it in your own projects.
*   **Distribution:** You may distribute the original or modified source code.
*   **Private Use:** You may use the software privately without releasing source code.

### Conditions & Limitations:
*   **License Notice:** A copy of the license and copyright notice must be included in all copies or substantial uses of the work.
*   **Liability:** The software is provided "as is", without warranty of any kind. The authors are not liable for any claims or damages arising from the use of the software.

For the full legal text, please refer to the `LICENSE` file in the root directory.

## Contact Info
*   **Name:** Muhammad Affan
*   **GitHub:** [@M-Affan01](https://github.com/M-Affan01)
*   **Email:** maffan2830@gmail.com
