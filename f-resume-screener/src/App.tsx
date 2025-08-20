import { Toaster } from 'sonner';
import ParticleBackground from './components/ParticleBackground';
import JobApplicationForm from './components/JobApplicationForm';
import SubmissionHistory from './components/SubmissionHistory';

function App() {
  return (
    <div className="min-h-screen bg-transparent py-12 px-4 flex flex-col items-center">
      <ParticleBackground />

      {/* Logo */}
      <div className="absolute top-8 left-8">
        <h2 className="text-2xl font-bold bg-gradient-hero text-transparent bg-clip-text">
          Screener.ai
        </h2>
      </div>

      <div className="relative w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-gradient-hero text-transparent bg-clip-text animate-fadeIn">
          Screen Resumes with AI Faster
        </h1>

        <div className="space-y-6">
          <JobApplicationForm />
          <SubmissionHistory />
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
}

export default App;
