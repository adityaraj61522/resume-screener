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
