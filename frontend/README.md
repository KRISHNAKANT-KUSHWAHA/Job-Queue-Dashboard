# Frontend — Job Queue Dashboard

React + Vite frontend for managing and monitoring background jobs.

## Tech Stack
- React 19
- Vite
- JavaScript (JSX)
- Axios
- Vanilla CSS

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Verify `.env` has:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Key Components

- **`src/App.jsx`**: Central state coordinator for jobs, loading states, error handling (including 409 conflict detection), and status counters.
- **`src/components/JobForm.jsx`**: Controlled form to submit new jobs with client-side validation.
- **`src/components/StatusFilter.jsx`**: Dropdown filter to view specific status subsets.
- **`src/components/JobList.jsx`**: Table mapping jobs to contextual actions (`Run`, `Complete`, `Fail`, `Delete`).
- **`src/services/jobApi.js`**: Axios methods for backend communication.
