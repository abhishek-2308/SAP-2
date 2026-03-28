# Render PostgreSQL Setup Procedure

To configure a PostgreSQL database on Render for the `trello_cello` project, follow these steps:

## 1. Create a Render Account
- Sign up at [dashboard.render.com](https://dashboard.render.com/).
- It's recommended to sign up with GitHub/GitLab to make future deployments easier.

## 2. Create the Database Instance
- Select **New +** > **PostgreSQL** in the dashboard.
- **Form Configuration**:
    - **Name**: `trello-cello-db`
    - **Database Name**: `trello_db`
    - **User**: `trello_user`
    - **Region**: Select the one closest to you (e.g., Singapore `ohio-1`, etc.).
    - **Plan**: Select **Free** (or your preferred tier).
- Click **Create Database**.

## 3. Retrieve Connection Strings
Wait for the status to show as **Available**.
- **Internal Database URL**: Use this for connecting from services **hosted on Render** (e.g., your Backend service).
- **External Database URL**: Use this for connecting from **local development** or external tools (e.g., `psql`, PGAdmin).

## 4. Environment Configuration
Add the following to your Backend `.env` file:
```env
DATABASE_URL=your_external_database_url_here
```

## 5. Security Notes
- Render's Free Tier databases are publicly accessible if you have the External URL, but they require SSL. Your client library (like `pg` or `sequelize`) should be configured to use SSL.
- **Example connection in Node.js**:
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
```

> [!WARNING]
> Render's Free Tier databases expire after 90 days if not upgraded. Be sure to back up your data or upgrade to a paid tier for production use.
