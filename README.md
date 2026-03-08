<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/2

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
   
INSERT INTO users (id, email, password_hash, name, role, verified, verification_status) 
VALUES (
  UUID(),
  'admin@howsitter.com',
  '$2b$10$9Jx0u4r0m5Vq1A2b3C4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4', -- Hashed version of 'Admin123'
  'System Administrator',
  'admin',
  TRUE,
  'approved'
);