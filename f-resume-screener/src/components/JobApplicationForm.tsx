import { useState, useCallback } from 'react';
import { FileText, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import type { JobApplication } from '../types';

const JobApplicationForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        jobDescription: '',
    });
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile?.type !== 'application/zip') {
            toast.error('Please upload a ZIP file');
            return;
        }
        setFile(uploadedFile);
        toast.success('File uploaded successfully');
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/zip': ['.zip'],
        },
        maxFiles: 1,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please upload a ZIP file');
            return;
        }

        setIsSubmitting(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('documents', file);
            formDataToSend.append('name', formData.fullName);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('jobDescription', formData.jobDescription);

            const response = await fetch('http://localhost:5001/api/data', {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Upload failed');

            const newSubmission: JobApplication = {
                id: crypto.randomUUID(),
                ...formData,
                file: {
                    name: file.name,
                    size: file.size,
                },
                status: 'pending',
                timestamp: new Date().toISOString(),
                processId: data.processId,
            };

            // Store in session storage
            const submissions = JSON.parse(sessionStorage.getItem('submissions') || '[]');
            sessionStorage.setItem('submissions', JSON.stringify([newSubmission, ...submissions]));

            toast.success('Application submitted successfully!');
            setFormData({ fullName: '', email: '', jobDescription: '' });
            setFile(null);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-[95%] max-w-3xl mx-auto p-8 bg-white rounded-xl shadow-elegant animate-fadeIn">
            <div className="flex items-center space-x-2 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold bg-gradient-primary text-transparent bg-clip-text">
                    Job Application
                </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="fullName">
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="jobDescription">
                        Job Description
                    </label>
                    <textarea
                        id="jobDescription"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                        value={formData.jobDescription}
                        onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    />
                </div>

                <div>
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
                            }`}
                    >
                        <input {...getInputProps()} />
                        <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                        <p className="text-sm text-gray-600">
                            {file
                                ? `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                                : 'Drag & drop your ZIP file here, or click to select'}
                        </p>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    isLoading={isSubmitting}
                >
                    Submit Application
                </Button>
            </form>
        </div>
    );
};

export default JobApplicationForm;
