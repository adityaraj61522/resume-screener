# Resume Screener Frontend

A modern React application for uploading and screening resumes, featuring a beautiful particle background and GitHub-themed UI.

## Features

- Modern React + TypeScript setup with Vite
- Interactive particle background animation
- GitHub-themed UI using @primer/react components
- File upload support for ZIP files
- Responsive design
- Real-time form validation and error handling

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (version 16.x or higher)
- npm (version 7.x or higher)
- The backend server (b-resume_screener) running on port 8000

## Installation

1. Clone the repository:
```bash
git clone [your-repo-url]
cd f-resume-screener
```

2. Install dependencies:
```bash
# Install with legacy peer deps to resolve styled-components compatibility
npm install --legacy-peer-deps
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to:
- http://localhost:5173 (or the port shown in your terminal)

## Usage

1. Fill in the required fields:
   - Name
   - Email
   - Upload a ZIP file containing your resume

2. Click the "Upload Resume" button to submit

3. The application will:
   - Validate your inputs
   - Show loading state during upload
   - Display success/error messages
   - Communicate with the backend server

## Configuration

The backend server URL is configured to `http://localhost:8000`. If you need to change this:
1. Open `src/components/UploadForm.tsx`
2. Modify the fetch URL in the `handleSubmit` function

## Development

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Tech Stack

- React 18
- TypeScript
- Vite
- @primer/react (GitHub's design system)
- @tsparticles/react (Particle background)
- styled-components
- axios

## Known Issues and Solutions

1. If you see styled-components version conflicts:
   ```bash
   npm install --legacy-peer-deps
   ```

2. If particles don't show up:
   - Make sure you have a proper GPU-enabled browser
   - Try reducing the number of particles in ParticleBackground.tsx
```
