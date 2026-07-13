
# Smart Water Leak Dashboard

A full-stack web app to monitor water flow, pressure, and detect leaks.

## Tech Stack

- **Backend**: Node.js, Express, PostgreSQL, Knex.js
- **Frontend**: Plain HTML, CSS, JavaScript, Chart.js (CDN)
- **Deployment**: Railway (easy to deploy both frontend and backend)

## Project Structure

```
Smart water system/
├── backend/
│   ├── migrations/
│   │   └── 20240101000000_create_sensor_readings.js
│   ├── index.js
│   ├── knexfile.js
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example
└── README.md
```

## Run Locally

### 1. Setup PostgreSQL
- Make sure PostgreSQL is running locally
- Create a database (e.g., `smart_water_leak`)

### 2. Backend Setup
1. Navigate to `backend/`
2. Copy `.env.example` to `.env` and set the `DATABASE_URL` and `PORT`
3. Install dependencies: `npm install`
4. Run migrations: `npm run migrate`
5. Start the server: `npm start`

### 3. Frontend Setup
1. Navigate to `frontend/`
2. Open `index.html` in your browser (or use a local server like Live Server in VS Code)
3. Note: If you changed the backend port, update `API_BASE_URL` in `frontend/app.js`

## Deploy to Railway

### Deploy Backend
1. Push your code to GitHub
2. Go to [Railway](https://railway.app) and create a new project
3. Add a PostgreSQL service (from Railway's catalog)
4. Add a new service from your GitHub repo, pointing to the `backend/` folder
5. In the backend service:
   - Set `NODE_ENV=production`
   - The `DATABASE_URL` is automatically available from the PostgreSQL service
   - Set `PORT=3001` (or let Railway assign a port)
   - Add a start command: `npm run migrate && npm start`

### Deploy Frontend
- Option 1: Deploy static files to Railway too (add another service for frontend)
- Option 2: Use Vercel, Netlify, or GitHub Pages to host the static files
- Remember to update `API_BASE_URL` in `frontend/app.js` to your deployed backend URL!

