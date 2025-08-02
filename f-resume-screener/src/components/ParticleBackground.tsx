import { useEffect } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

const ParticleBackground = () => {
    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        });
    }, []);

    return (
        <Particles
            id="tsparticles"
            options={{
                background: {
                    color: '#0d1117',
                },
                particles: {
                    color: {
                        value: '#ffffff',
                    },
                    links: {
                        enable: true,
                        color: '#ffffff',
                        distance: 150,
                    },
                    move: {
                        enable: true,
                        speed: 2,
                    },
                    size: {
                        value: 1,
                    },
                    number: {
                        value: 80,
                    },
                },
            }}
        />
    );
};

export default ParticleBackground;
