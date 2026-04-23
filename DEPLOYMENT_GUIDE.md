# Deployment Guide — Lok Seva Medical Store

Follow these steps to deploy your full-stack application to the cloud.

---

## 1. Database: MongoDB Atlas (Cloud)

1.  **Create Account**: Sign up at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas).
2.  **Create Cluster**: Deploy a free shared cluster (M0).
3.  **Database User**: Create a user with a password. (Save this password!)
4.  **Network Access**: Add `0.0.0.0/0` (Allow access from anywhere) to the IP Whitelist.
5.  **Connection String**:
    - Click **Connect** → **Drivers**.
    - Copy the connection string. It looks like:
      `mongodb+srv://<db_user>:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
    - Replace `<db_user>` and `<db_password>` with your actual credentials.

---

## 2. Backend: Render

1.  **Create Account**: Sign up at [render.com](https://render.com).
2.  **New Web Service**:
    - Connect your GitHub repository.
    - Select the repository.
3.  **Configure Service**:
    - **Name**: `lok-seva-backend`
    - **Root Directory**: `server`
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
4.  **Environment Variables**:
    - Add all variables from your `.env`:
      - `PORT`: `10000` (Render default)
      - `NODE_ENV`: `production`
      - `JWT_SECRET`: `(generate a long random string)`
      - `CSRF_SECRET`: `(generate another long random string)`
      - `MONGODB_URI`: `(Your MongoDB Atlas connection string)`
      - `CLIENT_URL`: `https://your-frontend-app.vercel.app` (You'll update this after Vercel deployment)
5.  **Deploy**: Click **Create Web Service**.
6.  **Get URL**: Copy your Render URL (e.g., `https://lok-seva-backend.onrender.com`).

---

## 3. Frontend: Vercel

1.  **Create Account**: Sign up at [vercel.com](https://vercel.com).
2.  **New Project**:
    - Connect your GitHub repository.
    - Select the repository.
3.  **Configure Project**:
    - **Framework Preset**: `Vite` (Vercel usually detects this).
    - **Root Directory**: `client`
4.  **Environment Variables**:
    - Add:
      - `VITE_API_URL`: `https://your-backend-app.onrender.com/api` (Use the Render URL you copied in the previous step).
5.  **Deploy**: Click **Deploy**.
6.  **Get URL**: Copy your Vercel deployment URL.

---

## 4. Final Connection Step

1.  Go back to **Render** → **Environment Variables**.
2.  Update the `CLIENT_URL` to your actual Vercel URL (e.g., `https://lok-seva-medical.vercel.app`).
3.  Restart the Render service.

---

## Summary of URLs

| Service  | Variable Name in Config | Example Value |
|----------|-------------------------|---------------|
| Render   | `CLIENT_URL`            | `https://my-app.vercel.app` |
| Vercel   | `VITE_API_URL`          | `https://my-api.onrender.com/api` |

---

## ⚠️ Important Production Notes
- **Secure Cookies**: I have updated the code to use `secure: true` and `sameSite: 'none'`. This allows the login cookies to work across the different domains of Vercel and Render.
- **Seeding**: To seed the default user in production, you can temporarily change the Render **Start Command** to `npm run seed && node server.js` for one deployment, then change it back.
