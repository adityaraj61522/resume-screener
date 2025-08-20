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

    // Safeguard against undefined status
    const displayStatus = status || 'pending';
    const colorClass = colors[displayStatus] || colors.pending;

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
        </span>
    );
};

const SubmissionHistory = () => {
    const [submissions, setSubmissions] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Initialize email directly from localStorage
    const [email, setEmail] = useState<string>(localStorage.getItem('userEmail') || '');

    // Listen for changes to localStorage
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'userEmail') {
                setEmail(e.newValue || '');
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;
        console.log('Email effect running with:', email); // Debug log

        const fetchSubmissions = async () => {
            if (!email) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log('Fetching submissions for:', email); // Debug log
                const response = await fetch(`http://localhost:5001/api/submissions?email=${encodeURIComponent(email)}`, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error:', errorText); // Debug log
                    throw new Error(`Failed to fetch submissions: ${errorText}`);
                }

                const data = await response.json();
                console.log('Raw API response:', data); // Debug log
                console.log('Received submissions:', data); // Debug log

                if (!data.submissions) {
                    throw new Error('Invalid response format');
                }

                setSubmissions(data.submissions.map((sub: any) => ({
                    id: sub.processId,
                    fullName: sub.analysis?.name || 'Not available',
                    email: sub.userEmail,
                    jobDescription: sub.jobDescription || 'Not available',
                    file: {
                        name: sub.filename,
                        size: 0 // Size not available from backend
                    },
                    status: sub.status || sub.overallStatus || 'pending',
                    timestamp: sub.timestamp,
                    analysis: sub.analysis
                })));
            } catch (err) {
                console.error('Error fetching submissions:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch submissions');
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchSubmissions();

        // Set up polling for status updates
        pollInterval = setInterval(fetchSubmissions, 5000);

        // Cleanup interval on unmount or when email changes
        return () => {
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [email]); // Re-run effect when email changes

    if (loading) {
        return (
            <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-elegant mt-6 text-center animate-fadeIn">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading submissions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-elegant mt-6 text-center animate-fadeIn">
                <div className="text-red-500 mb-2">⚠️</div>
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!email) {
        return (
            <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-elegant mt-6 text-center animate-fadeIn">
                <Archive className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">Please submit an resume to see your results</p>
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="w-full max-w-xl p-6 bg-white rounded-xl shadow-elegant mt-6 text-center animate-fadeIn">
                <Archive className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No results found for {email}</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-xl mt-6 space-y-4 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800">Recent Results</h3>
            {submissions.map((submission) => (
                <div
                    key={submission.id}
                    className="p-4 bg-white rounded-lg shadow-elegant hover:shadow-lg transition-shadow"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h4 className="font-medium text-gray-900">{submission.analysis?.name}</h4>
                            <p className="text-sm text-gray-600">{submission.analysis?.email}</p>
                        </div>
                        <StatusBadge status={submission.status} />
                    </div>

                    {/* <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {submission.jobDescription}
                    </p> */}

                    {submission.status === 'completed' && submission.analysis && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-600">Match Score:</p>
                                    <p className="font-semibold text-gray-900">{submission.analysis.rank.score}%</p>
                                </div>
                                <div>
                                    <p className="text-gray-600">Experience:</p>
                                    <p className="font-semibold text-gray-900">{submission.analysis.experience} years</p>
                                </div>
                            </div>
                            <div className="mt-2">
                                <p className="text-gray-600 text-sm">Key Skills:</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {submission.analysis.skills.slice(0, 5).map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                        <span>
                            File: {submission.file.name}
                        </span>
                        <span>{new Date(submission.timestamp).toLocaleString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SubmissionHistory;
