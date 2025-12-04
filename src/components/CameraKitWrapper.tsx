import { useEffect, useRef, useState } from 'react';
import { bootstrapCameraKit, createMediaStreamSource, Transform2D } from '@snap/camera-kit';
import { LensesSelector } from './LensesSelector';

export const CameraKitWrapper = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLensesSelectorOpen, setIsLensesSelectorOpen] = useState(false);

    const toggleLensesSelector = () => {
        setIsLensesSelectorOpen(!isLensesSelectorOpen);
    };

    const handleSelectLens = (lensId: string) => {
        console.log('Selected lens:', lensId);
        setIsLensesSelectorOpen(false);
        // TODO: Implement lens switching logic here
    };

    useEffect(() => {
        let session: any;
        let stream: MediaStream;
        let isMounted = true;

        const initCameraKit = async () => {
            try {
                // TODO: Replace these with your actual credentials from the Snap Kit Portal
                const apiToken = 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNzMyNjE1MzY5LCJzdWIiOiI4NDY2ZTk1NS1mNWQxLTQ1MWUtYTFkYy0zN2YzZWJmODJlMjZ-U1RBR0lOR342OWRiMjFlOS05MzNjLTQ2M2EtOTFjZS1kZWQzMjNjNWU3MTUifQ.o0f-fIr0HpC-Mo0Gz16j83Z4D3SiCFoj7sGEs1_xF_Y';
                const lensId = '69ae3754-22d2-45ee-82b2-8281dfd5589d';
                const groupId = 'afc89d57-20e0-4d73-9ecd-0d07065bbcc6';

                // @ts-ignore
                if (apiToken === 'YOUR_API_TOKEN_HERE') {
                    console.warn('Camera Kit: Please provide a valid API Token.');
                    if (isMounted) setError('Please configure your API Token in src/components/CameraKitWrapper.tsx');
                    return;
                }

                const cameraKit = await bootstrapCameraKit({ apiToken });
                if (!isMounted) return;

                if (!canvasRef.current) return;

                session = await cameraKit.createSession({ liveRenderTarget: canvasRef.current });
                if (!isMounted) {
                    session.pause();
                    return;
                }

                session.events.addEventListener('error', (event: any) => {
                    console.error('Camera Kit Session Error:', event.detail.error);
                    if (isMounted) setError(event.detail.error.message);
                });

                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (!isMounted) {
                    stream.getTracks().forEach(track => track.stop());
                    session.pause();
                    return;
                }

                const source = createMediaStreamSource(stream, { transform: Transform2D.MirrorX, cameraType: 'user' });
                await session.setSource(source);
                await session.play();
                await source.setRenderSize(1080, 1920);

                const lens = await cameraKit.lensRepository.loadLens(lensId, groupId);
                if (!isMounted) return;

                await session.applyLens(lens).then(() => {
                    console.log('Lens applied successfully');
                }).catch(() => {
                    console.error('Failed to apply lens:');
                });

                setIsLoading(false);
            } catch (err: any) {
                console.error('Camera Kit Initialization Error:', err);
                if (isMounted) setError(err.message || 'Failed to initialize Camera Kit');
            }
        };

        initCameraKit();

        return () => {
            isMounted = false;
            // Cleanup
            if (session) {
                session.pause();
            }
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    if (error) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                color: 'red',
                backgroundColor: '#1a1a1a'
            }}>
                <h2>{error}</h2>
            </div>
        );
    }

    return (
        <div className="camera-container">
            <canvas
                ref={canvasRef}
                id="CameraKit-AR-Canvas"
                className="camera-canvas"
            />

            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            <div className="ui-overlay">
                {/* Top Bar */}
                <div className="top-bar">
                    <button className="icon-button" aria-label="Flip Camera">
                        <svg viewBox="0 0 24 24">
                            <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" />
                        </svg>
                    </button>
                </div>

                {/* Bottom Controls */}
                <div className="bottom-controls">
                    <div className="hint-pill">
                        Point at a face and tap to swap!
                    </div>

                    <div className="controls-row">
                        <button className="icon-button" aria-label="Gallery">
                            <svg viewBox="0 0 24 24">
                                <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z" />
                            </svg>
                        </button>

                        <button className="shutter-button" aria-label="Take Photo">
                            <div className="shutter-inner" />
                        </button>

                        <button className="icon-button" aria-label="Lenses" onClick={toggleLensesSelector}>
                            <svg viewBox="0 0 24 24">
                                <path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <LensesSelector
                isOpen={isLensesSelectorOpen}
                onClose={() => setIsLensesSelectorOpen(false)}
                onSelectLens={handleSelectLens}
            />
        </div>
    );
};
