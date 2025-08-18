import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import type { JobApplication } from '../types';

const StatusBadge = ({ status }: { status: JobApplication['status'] }) => {
    const colors = {
        pending: 'bg-blue-100 text-blue-800',
        processing: 'bg-yellow-100 text-yellow-800',
        completed: 'bg-green-100 text-green-800',
        error: 'bg-red-100 text-red-800',
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
};

const SubmissionHistory = () => {
    const [submissions, setSubmissions] = useState<JobApplication[]>([]);

    useEffect(() => {
        const storedSubmissions = sessionStorage.getItem('submissions');
        if (storedSubmissions) {
            setSubmissions(JSON.parse(storedSubmissions));
        }

        const handleStorage = () => {
            const updated = sessionStorage.getItem('submissions');
            if (updated) {
                setSubmissions(JSON.parse(updated));
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    if (submissions.length === 0) {
        return (
            <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-elegant mt-6 text-center animate-fadeIn">
                <Archive className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No submissions yet</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mt-6 space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800">Recent Submissions</h3>
            {submissions.map((submission) => (
                <div
                    key={submission.id}
                    className="p-4 bg-white rounded-lg shadow-elegant hover:shadow-lg transition-shadow"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-medium text-gray-900">{submission.fullName}</h4>
                            <p className="text-sm text-gray-600">{submission.email}</p>
                        </div>
                        <StatusBadge status={submission.status} />
                    </div>

                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {submission.jobDescription}
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>
                            File: {submission.file.name} ({(submission.file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <span>{new Date(submission.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SubmissionHistory;
