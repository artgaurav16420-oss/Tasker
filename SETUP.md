# Tasker — Local Network Deployment Guide

This guide walks you through setting up Tasker on your computer and making it accessible to any device on your local network. No coding experience required.

## 1. Prerequisites

Before starting, you need a few things:

1. **Node.js** — the engine that runs the application.
   - Go to [nodejs.org](https://nodejs.org/) and download the **LTS** version.
   - Install with default settings.
   - **Verify**: Open a terminal and run `node -v` and `npm -v`. Both should print version numbers. If you get "command not found", restart your terminal or reinstall Node.js and make sure it's added to your PATH.

2. **A Supabase account** — free cloud service for the database.
   - Go to [supabase.com](https://supabase.com/) and click **Start your project** to create a free account.

3. **Download this project.**
   - On GitHub, click the green **Code** button → **Download ZIP**.
   - Extract the folder somewhere easy to find (like your Desktop).

---

## 2. Setting Up the Database (Supabase)

1. **Create a project.**
   - Log into your Supabase account.
   - Click **New Project**.
   - Name it "Tasker", set a strong database password (save it), pick a region, and click **Create new project**. Wait a few minutes for it to finish.

2. **Enable Email authentication.**
   - In the left sidebar, go to **Authentication** → **Providers**.
   - Make sure **Email** is enabled (green toggle). This lets users sign up and log in.

3. **Configure Site URL (required for email redirects).**
    - In Authentication → **Settings**.
    - Set **Site URL** to `http://localhost:3000`.
    - Scroll down and add `http://localhost:3000` to **Redirect URLs**.
    - If you will open the app from another device using your computer's network address, also add that exact address to **Redirect URLs**. Example: `http://10.34.2.206:3000`.

4. **Decide on email confirmation.**
   - By default, Supabase requires users to confirm their email before signing in.
   - To disable this (allows instant login after signup): in the same Auth → Settings page, disable **Confirm email** under the Email section.
   - If you keep it enabled, users must check their inbox and click the confirmation link.

5. **Run the SQL setup script.**
   - In the left sidebar, click **SQL Editor** → **New query**.
   - Open the file `setup.sql` from the Tasker project folder. Copy all its contents and paste into the SQL Editor.
   - Click **Run**. You should see a "Success" message. This creates the database tables, security rules, and helper functions.

---

## 3. Connecting the App to the Database

1. **Find your API keys.**
   - In Supabase, go to **Project Settings** (gear icon) → **API**.
   - Copy the **Project URL** and the **anon public** key.

2. **Create the config file.**
   - In the Tasker project folder, make a copy of `.env.example` and rename it to `.env.local`.
   - **Windows users**: File Explorer may hide file extensions. Enable **View → Show → File name extensions** so the file becomes `.env.local`, not `.env.local.txt`.

3. **Add your keys.**
   - Open `.env.local` with a text editor.
   - Replace the values so it looks like this (without quotes):
     ```env
     VITE_SUPABASE_URL=https://your-project-id.supabase.co
     VITE_SUPABASE_ANON_KEY=your-long-anon-key-here
     ```
   - Save and close.

---

## 4. Launching the App

1. **Open a terminal in the project folder.**
   - **Windows**: Open the folder in File Explorer, click the address bar, type `cmd`, and press Enter.
   - **Mac**: Right-click the folder in Finder and select **New Terminal at Folder**.

2. **Install dependencies.**
   ```bash
   npm install
   ```
   Wait for it to finish.

3. **Start the dev server.**
   ```bash
   npm run dev
   ```
   The terminal will print a Local address like `http://localhost:3000`.

4. **Open the app.**
   - Go to `http://localhost:3000` in your browser.
   - Click **Sign Up** to register the first user account. (If email confirmation is enabled, check your inbox first.)

   **Important:** Keep this terminal window open. Close it with `Ctrl + C` to stop the server.

---

## 5. Accessing from Other Devices

Other phones, tablets, or computers on the **same local network** can reach the app.

1. **Find your computer's local IP address.**
   - **Windows**: Open a new `cmd` window (leave the server one running!) and type `ipconfig`. Look for the `IPv4 Address` (e.g., `192.168.1.15`).
   - **Mac**: Go to System Settings → Network → Wi-Fi → Details. Look for your IP address.

2. **Open the app on another device.**
   - Open a browser and go to `http://<YOUR_IP>:3000` (e.g., `http://192.168.1.15:3000`).

---

## 6. Troubleshooting

| Symptom | Likely fix |
|---------|-----------|
| `npm` is not recognized | Node.js isn't installed correctly. Restart your computer or reinstall Node.js. |
| Other devices can't connect | Your firewall may be blocking port 3000. Allow inbound traffic on port 3000 in your firewall settings. |
| Login works on `localhost` but not on `http://<YOUR_IP>:3000` | Add `http://<YOUR_IP>:3000` to Supabase Authentication → Settings → Redirect URLs. Browser login sessions are also origin-specific, so logging in on `localhost` does not automatically log you in on the IP address. |
| App loads but is blank or shows errors | Check `.env.local` for typos or extra spaces. Make sure you ran `setup.sql` in Supabase. |
| "Address already in use" / port 3000 taken | Another program is on that port. Restart your computer, or kill the process: Windows → `netstat -ano \| findstr :3000` then `taskkill /F /PID <PID>`; Mac → `lsof -i :3000` then `kill <PID>`. |
| Different network | Both the server and other devices **must** be on the same local network (same router / Wi-Fi). |
