@echo off
echo Setting up How Sitter project...

echo Setting up Backend...
cd backend
call npm install
echo Backend setup complete!

echo Setting up Frontend...
cd ..\frontend
call npm install
echo Frontend setup complete!

echo All setup complete!
echo.
echo To run the application:
echo 1. Start Backend: cd backend && npm start
echo 2. Start Frontend: cd frontend && npm run dev
echo.
echo Then open: http://localhost:5173