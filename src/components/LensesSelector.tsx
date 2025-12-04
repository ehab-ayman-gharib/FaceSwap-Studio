import React from 'react';
import lensesData from '../data/lenses.json';

interface Lens {
    id: string;
    title: string;
    thumbnail: string;
}

interface LensesSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectLens: (lensId: string) => void;
}

export const LensesSelector: React.FC<LensesSelectorProps> = ({ isOpen, onClose, onSelectLens }) => {
    if (!isOpen) {
        console.log('LensesSelector: isOpen is false');
        return null;
    }

    return (
        <div className="lenses-selector-overlay">
            <div className="lenses-selector-header">
                <button className="close-button" onClick={onClose}>
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                    </svg>
                </button>
                <h2>Templates</h2>
                <div style={{ width: 24 }}></div> {/* Spacer for centering */}
            </div>

            <div className="lenses-grid">
                {lensesData.map((lens: Lens) => (
                    <div
                        key={lens.id}
                        className="lens-card"
                        onClick={() => onSelectLens(lens.id)}
                    >
                        <img src={lens.thumbnail} alt={lens.title} loading="lazy" />
                        <div className="lens-title-overlay">
                            <span>{lens.title}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
