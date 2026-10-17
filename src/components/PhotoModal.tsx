import React, { useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Sparkles } from 'lucide-react';
import type { PhotoItem } from '../types';

interface PhotoModalProps {
  photo: PhotoItem;
  allPhotos: PhotoItem[];
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const PhotoModal: React.FC<PhotoModalProps> = ({
  photo,
  allPhotos,
  onClose,
  onNavigate,
}) => {
  const currentIndex = allPhotos.findIndex((p) => p.id === photo.id);
  const [imageSrc, setImageSrc] = useState(photo.url);
  const [isLiked, setIsLiked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setImageSrc(photo.url);
    setLoaded(false);
  }, [photo]);

  // Keyboard navigation inside lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        const prevIdx = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
        onNavigate(prevIdx);
      } else if (e.key === 'ArrowRight') {
        const nextIdx = (currentIndex + 1) % allPhotos.length;
        onNavigate(nextIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allPhotos.length, onClose, onNavigate]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prevIdx = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    onNavigate(prevIdx);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextIdx = (currentIndex + 1) % allPhotos.length;
    onNavigate(nextIdx);
  };

  const handleImageError = () => {
    if (photo.fallbackUrl && imageSrc !== photo.fallbackUrl) {
      setImageSrc(photo.fallbackUrl);
    }
  };

  return (
    <div className="photo-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="photo-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close photo preview">
          <X size={22} />
        </button>

        {/* Previous Button */}
        <button
          className="modal-nav-btn prev-btn"
          onClick={handlePrev}
          aria-label="Previous photograph"
        >
          <ChevronLeft size={28} />
        </button>

        {/* Next Button */}
        <button
          className="modal-nav-btn next-btn"
          onClick={handleNext}
          aria-label="Next photograph"
        >
          <ChevronRight size={28} />
        </button>

        {/* Photo Card with Gold Film Frame */}
        <div className="modal-photo-card glass-panel">
          <div className={`modal-img-wrapper ${loaded ? 'is-loaded' : 'is-loading'}`}>
            <img
              src={imageSrc}
              alt={photo.caption}
              className="modal-photo-img"
              onError={handleImageError}
              onLoad={() => setLoaded(true)}
              loading="eager"
            />
            {!loaded && (
              <div className="image-loading-placeholder">
                <Sparkles size={28} className="spin-icon text-gold" />
                <span>Loading gentle memory...</span>
              </div>
            )}
          </div>

          {/* Photo Info & Caption */}
          <div className="modal-info-panel">
            <div className="modal-info-top">
              {photo.tag && <span className="photo-tag-pill">{photo.tag}</span>}
              <button
                className={`heart-toggle-btn ${isLiked ? 'liked' : ''}`}
                onClick={() => setIsLiked(!isLiked)}
                aria-label="Favorite memory"
              >
                <Heart size={20} className={isLiked ? 'fill-rose' : ''} />
                <span>{isLiked ? 'Cherished 💖' : 'Love this'}</span>
              </button>
            </div>

            <p className="modal-caption-text">{photo.caption}</p>

            <div className="modal-info-bottom">
              <span className="photo-counter">
                {currentIndex + 1} of {allPhotos.length}
              </span>
              <span className="keyboard-tip">Use ← and → arrows to browse</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .photo-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(4, 1, 6, 0.88);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          animation: modalFadeIn 0.3s ease-out forwards;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .photo-modal-container {
          position: relative;
          max-width: 900px;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn {
          position: absolute;
          top: -18px;
          right: -18px;
          z-index: 20;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(30, 10, 25, 0.9);
          border: 1px solid var(--border-highlight);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease, background 0.2s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5);
        }

        .modal-close-btn:hover {
          transform: scale(1.1);
          background: var(--burgundy);
          color: var(--gold-warm);
        }

        .modal-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 15;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(25, 8, 22, 0.85);
          border: 1px solid rgba(243, 198, 143, 0.3);
          color: var(--gold-warm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .modal-nav-btn:hover {
          transform: translateY(-50%) scale(1.15);
          background: rgba(48, 16, 42, 0.95);
          border-color: var(--color-primary);
        }

        .prev-btn { left: -24px; }
        .next-btn { right: -24px; }

        .modal-photo-card {
          width: 100%;
          display: flex;
          flex-direction: column;
          border-radius: 24px;
          overflow: hidden;
          background: #110513;
          border: 1px solid var(--color-border);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.9), 0 0 50px rgba(239, 195, 202, 0.2);
        }

        .modal-img-wrapper {
          position: relative;
          width: 100%;
          height: min(65vh, 520px);
          background: #08020a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .modal-photo-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center 25%;
          transition: transform 0.4s ease;
        }

        .image-loading-placeholder {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--color-primary);
          font-size: 0.9rem;
        }

        .modal-info-panel {
          padding: 24px 32px;
          background: linear-gradient(180deg, rgba(28, 10, 26, 0.95) 0%, rgba(14, 4, 15, 0.98) 100%);
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-top: 1px solid var(--color-border-subtle);
        }

        .modal-info-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .photo-tag-pill {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 4px 12px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.14);
          border: 1px solid var(--color-border);
          color: var(--color-primary);
          font-weight: 600;
        }

        .heart-toggle-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--color-border);
          color: var(--text-secondary);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.82rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .heart-toggle-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .heart-toggle-btn.liked {
          background: rgba(239, 195, 202, 0.18);
          border-color: var(--color-primary);
          color: var(--color-primary);
        }

        .fill-rose {
          fill: var(--color-primary);
        }

        .modal-caption-text {
          font-family: var(--font-serif);
          font-size: 1.35rem;
          color: #FFF9F8;
          font-style: italic;
          line-height: 1.4;
        }

        .modal-info-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 10px;
        }

        @media (max-width: 640px) {
          .photo-modal-backdrop {
            padding: 12px;
          }
          .modal-close-btn {
            top: 10px;
            right: 10px;
          }
          .prev-btn { left: 4px; }
          .next-btn { right: 4px; }
          .modal-info-panel {
            padding: 16px 20px;
          }
          .modal-caption-text {
            font-size: 1.1rem;
          }
          .keyboard-tip {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
