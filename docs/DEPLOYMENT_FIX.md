# Fixing Deployment Connectivity Issues

The project isn't "opening" on other devices because the Frontend (Vercel) likely cannot communicate with the Backend (Render). Here is the plan to fix the bridge between them.

## 1. Environment Variable Configuration (CRITICAL)

The most common reason for this failure is that your frontend is still trying to talk to `localhost:5001` instead of your deployed backend.

### Action: Update Vercel Settings
1. Go to your **Vercel Dashboard** -> Project Settings -> **Environment Variables**.
2. Add a new variable:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://your-backend-name.onrender.com` (Use your actual Render URL).
3. **Redeploy** the project on Vercel for the changes to take effect.

### Action: Update Render Settings
1. Go to your **Render Dashboard** -> Your Web Service -> **Environment**.
2. Add/Edit the following variable:
   - **Key**: `CLIENT_URL`
   - **Value**: `https://your-frontend-name.vercel.app` (Use your actual Vercel URL).
3. Add/Edit (Optional but recommended):
   - **Key**: `NODE_ENV`
   - **Value**: `production`
4. Render will usually restart automatically.

---

## 2. CORS (Cross-Origin Resource Sharing) Check

Your backend specifically restricts requests to the `CLIENT_URL` you define. If this doesn't match exactly what you see in the browser address bar (including `https://`), the browser will block the request for security.

### Troubleshooting:
- Open the "Inspect" tool (F12) on your phone or laptop.
- Check the **Console** for errors like "CORS policy: No 'Access-Control-Allow-Origin' header is present".
- If you see this, it means the `CLIENT_URL` on Render is incorrect or missing.

---

## 3. Database Connectivity

If the app opens but shows no data (empty boards):
- Ensure your backend on Render has the `DATABASE_URL` set correctly to a cloud database (like Render's own PostgreSQL or Supabase).
- Local databases (using `localhost` in the connection string) will **not** work once deployed.

---

## 4. Mixed Content (HTTPS)

- **Vercel** is always `https://`.
- **Render** is `https://`.
- Ensure your `NEXT_PUBLIC_API_URL` starts with `https://`. If you use `http://`, browsers will block it as "Mixed Content."

---

## Summary Checklist
- [ ] `NEXT_PUBLIC_API_URL` is set on Vercel.
- [ ] `CLIENT_URL` is set on Render (matching the Vercel URL).
- [ ] Both URLs use `https://`.
- [ ] Vercel has been redeployed after adding the variable.
