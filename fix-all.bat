@echo off
echo ========================================
echo QUICK FIX FOR HOW SITTER FRONTEND
echo ========================================

echo Step 1: Creating missing CSS file...
cd frontend\src
echo @import "tailwindcss/base"; > index.css
echo @import "tailwindcss/components"; >> index.css
echo @import "tailwindcss/utilities"; >> index.css
echo. >> index.css
echo :root { >> index.css
echo   --primary: #009639; >> index.css
echo   --primary-hover: #007a2e; >> index.css
echo   --secondary: #2563eb; >> index.css
echo   --accent: #fbbf24; >> index.css
echo   --dark: #1f2937; >> index.css
echo   --light-gray: #f9fafb; >> index.css
echo   --gray: #6b7280; >> index.css
echo   --border: #e5e7eb; >> index.css
echo   --status-red: #ef4444; >> index.css
echo   --status-blue: #3b82f6; >> index.css
echo } >> index.css
echo. >> index.css
echo body { >> index.css
echo   font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif; >> index.css
echo   margin: 0; >> index.css
echo   padding: 0; >> index.css
echo   background-color: white; >> index.css
echo   color: var(--dark); >> index.css
echo } >> index.css
echo. >> index.css
echo * { >> index.css
echo   box-sizing: border-box; >> index.css
echo } >> index.css

echo Step 2: Checking index.tsx...
cd ..
if not exist src\index.tsx (
    echo Creating index.tsx...
    echo import React from "react"; > src\index.tsx
    echo import ReactDOM from "react-dom/client"; >> src\index.tsx
    echo import App from "./App"; >> src\index.tsx
    echo import "./index.css"; >> src\index.tsx
    echo. >> src\index.tsx
    echo const rootElement = document.getElementById("root"); >> src\index.tsx
    echo if (!rootElement) { >> src\index.tsx
    echo   throw new Error("Could not find root element"); >> src\index.tsx
    echo } >> src\index.tsx
    echo. >> src\index.tsx
    echo const root = ReactDOM.createRoot(rootElement); >> src\index.tsx
    echo root.render( >> src\index.tsx
    echo   ^<React.StrictMode^> >> src\index.tsx
    echo     ^<App /^> >> src\index.tsx
    echo   ^</React.StrictMode^> >> src\index.tsx
    echo ); >> src\index.tsx
)

echo Step 3: Creating Tailwind config files...
if not exist tailwind.config.js (
    echo module.exports = { > tailwind.config.js
    echo   content: [ >> tailwind.config.js
    echo     "./index.html", >> tailwind.config.js
    echo     "./src/**/*.{js,ts,jsx,tsx}", >> tailwind.config.js
    echo   ], >> tailwind.config.js
    echo   theme: { >> tailwind.config.js
    echo     extend: { >> tailwind.config.js
    echo       colors: { >> tailwind.config.js
    echo         primary: "#009639", >> tailwind.config.js
    echo         "primary-hover": "#007a2e", >> tailwind.config.js
    echo         secondary: "#2563eb", >> tailwind.config.js
    echo         accent: "#fbbf24", >> tailwind.config.js
    echo         dark: "#1f2937", >> tailwind.config.js
    echo         "light-gray": "#f9fafb", >> tailwind.config.js
    echo         gray: "#6b7280", >> tailwind.config.js
    echo         border: "#e5e7eb", >> tailwind.config.js
    echo         "status-red": "#ef4444", >> tailwind.config.js
    echo         "status-blue": "#3b82f6", >> tailwind.config.js
    echo       } >> tailwind.config.js
    echo     } >> tailwind.config.js
    echo   }, >> tailwind.config.js
    echo   plugins: [], >> tailwind.config.js
    echo } >> tailwind.config.js
)

if not exist postcss.config.js (
    echo module.exports = { > postcss.config.js
    echo   plugins: { >> postcss.config.js
    echo     tailwindcss: {}, >> postcss.config.js
    echo     autoprefixer: {}, >> postcss.config.js
    echo   }, >> postcss.config.js
    echo } >> postcss.config.js
)

echo Step 4: Installing missing dependencies...
call npm install tailwindcss postcss autoprefixer

echo.
echo ========================================
echo FIX COMPLETE!
echo ========================================
echo.
echo Now run: npm run dev
echo Then open: http://localhost:5173
echo.
pause