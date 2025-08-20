interface ResumeAnalysis {
    name: string;
    phone: string;
    email: string;
    skills: string[];
    rank: {
        score: number;
        matches: string[];
        gaps: string[];
    };
    experience: number;
    projects: string[];
    sector: string;
    links: {
        github?: string;
        linkedin?: string;
        portfolio?: string;
        other?: string[];
    };
}

export interface JobApplication {
    id: string;
    fullName: string;
    email: string;
    jobDescription: string;
    file: {
        name: string;
        size: number;
    };
    status: 'pending' | 'processing' | 'completed' | 'error';
    timestamp: string;
    processId?: string;
    analysis?: ResumeAnalysis;
}

export interface ParticleConfig {
    x: number;
    y: number;
    radius: number;
    color: string;
    velocity: {
        x: number;
        y: number;
    };
    opacity: number;
}
