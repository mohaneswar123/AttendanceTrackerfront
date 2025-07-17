# Attendance Register

This is an Attendance Register application built with React, Vite, and styled using Tailwind CSS. The app allows users to manage attendance records efficiently.

## Project Structure

```
attendance-register
├── src
│   ├── assets
│   ├── components
│   │   ├── AttendanceForm.jsx
│   │   ├── AttendanceList.jsx
│   │   ├── Header.jsx
│   │   └── Layout.jsx
│   ├── contexts
│   │   └── AttendanceContext.jsx
│   ├── hooks
│   │   └── useAttendance.js
│   ├── pages
│   │   ├── Dashboard.jsx
│   │   ├── History.jsx
│   │   └── Settings.jsx
│   ├── utils
│   │   ├── api.js
│   │   └── dateUtils.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public
│   └── favicon.svg
├── .eslintrc.cjs
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Features

- **Attendance Entry**: Users can enter attendance records through a form.
- **Attendance History**: Users can view past attendance records.
- **Settings**: Users can manage subjects and reset attendance records.

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   cd attendance-register
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Dependencies

- **React**: A JavaScript library for building user interfaces.
- **React Router**: For routing and navigation.
- **Axios**: For making HTTP requests.
- **Tailwind CSS**: For styling the application.

## Development

- Use the `src` directory to add components, pages, and utilities.
- Follow best practices for component structure and state management.

## License

This project is licensed under the MIT License.