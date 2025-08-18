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
                fullScreen: {
                    enable: true,
                    zIndex: -1
                },
                background: {
                    color: {
                        value: ''  // transparent background to let CSS gradient show
                    },
                },
                particles: {
                    color: {
                        value: ["#FF1493", "#FF69B4", "#FF0066", "#FF1493"]
                    },
                    links: {
                        color: "#FF1493",
                        distance: 150,
                        enable: true,
                        opacity: 0.8,
                        width: 2
                    },
                    collisions: {
                        enable: true
                    },
                    move: {
                        direction: "none",
                        enable: true,
                        outModes: {
                            default: "bounce"
                        },
                        random: false,
                        speed: 3,
                        straight: false
                    },
                    number: {
                        density: {
                            enable: true
                        },
                        value: 100
                    },
                    opacity: {
                        value: 0.9
                    },
                    shape: {
                        type: "circle"
                    },
                    size: {
                        value: { min: 2, max: 5 }
                    }
                },
                detectRetina: true,
                fpsLimit: 120,
                interactivity: {
                    detectsOn: "canvas",
                    events: {
                        onClick: {
                            enable: true,
                            mode: "push"
                        },
                        onHover: {
                            enable: true,
                            mode: "repulse"
                        }
                    },
                    modes: {
                        push: {
                            quantity: 4
                        },
                        repulse: {
                            distance: 100,
                            duration: 0.4
                        }
                    }
                },
            }}
        />
    );
};

export default ParticleBackground;
