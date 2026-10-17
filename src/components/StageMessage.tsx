import React, { useState, useEffect, useRef } from 'react';
import { Heart, ArrowRight, ArrowLeft, Mail } from 'lucide-react';
import type { BirthdayConfig } from '../types';
import { memoryAudioController } from '../utils/memoryAudioController';

interface StageMessageProps {
  config: BirthdayConfig;
  onProceed: () => void;
}

type EnvelopeState = 'sealed' | 'dragging' | 'untying' | 'opening' | 'rising' | 'letter-view';

const DEFAULT_PAGE_1_PARAGRAPHS = [
  "First time una pathadhu clg bus la dha.... Apo nee yaru, un name, ena department kuda theriyathu.. just bus la random ah yarachu papom la aprm avanga next pakave mudiyathu like that... After bridge course, regular class start Achu apo students ellarum split pani department la potanga... Apo dha una namba class la pathen. Enaku apdiye sudden shock. Ne epdi inga nu. Aprm un name therinjuchu. One day Unaku neyabakam iruka nu therla first apo tha unkita notes kettu pesunen. Patha nee english laye pesitu irundha... Nanum manage pani dha pesuna.. but at the end, nane unkita ketten tamil theriyatha.. tamil la pesu nu ketten. Adhuku ne strangers kita english la dha pesuva nu sonna.. but,one day na clg leave pottu jolly a irukiya nu ketten..adhuku ne tamil la reply pana first time.. enaku apdiye shock..aprm dha unkita ketten hey ne dha pesuriya ila vera yaravadha nu. Ne edhuku kekura nu keta. Adha ne already sonna la strangers kitta english la dha pesuven nu . Odane ne laughing emoji send panita 😂. I don't know whether you remember or not...i still remember it as one of my sweetest day of my first year."
];

const DEFAULT_PAGE_2_PARAGRAPHS = [
  "Aprm second year apo apo unkita pesunen.. mrng ne Vera bus la varuva.. evng mattum dha en bus la varuva apo dha unkita pesuven.. ne front seat la irupa na last seat la irupen. Suma fun ah pesitu irupom.. adhuvum rainy days la neraya vatti pesirupom la... May be they were just normal moments for you, but for me, they became beautiful memories... I'll always carry in my heart.. aprm Pongal celebration apo.. ne black saree la vandha.. you look so pretty on that day... Na kuda chat la unaku compliment sonna neyabakam iruka.. avlo crowd la kuda ne mattum thaniya therinja....aprm lab spiral pottu unaku kuduka ketten adhu ne pay pani dha vangipen Ilana vanga matten nu evlo neram chat la argue paniye i still remember....One day mattum na marakave matten.. 25 September 2024 ... Apo dha ne aludha dha pathen... enaku romba kastama irundhuchu.. apo andha time ne evlo emotional ah irupa nu purinjidhu... Unkita vandhu pesanum, enachu kekanum nu nenchen.. but enala mudila.. because of my hesitation.. as a frnd or whatever.. na vandhu unkita keturukanum.. ipo varaikum na Adhuku regret pandren... Adhuku dha unaku romba memorable ah close to heart oru gift kuduthen..I hope you still have the gift.. apo una force Panni kuduthutten.. once again sorry"
];

const DEFAULT_PAGE_3_PARAGRAPHS = [
  "Third year la kjm misunderstanding la nadandhuchu... Oru sila vishayam la enaku therinjuchu..na adha pathila unkita edhuvum solala.. enaku romba hurt agiduchu adha ketu.... Aprm nane realize pana una force pani pesura mari irundhuchu... Sometimes ne reply ye pana matta..but whenever I talk to you, ne natural ah pesuva without any hesitation.. i genuinely liked that about you... Nane unkuda pesa kudathu..una disturb pana kudathu nu irupen.. but sometimes epdiyo therila epayachu Suma edhana random ah pesiduven.. unkuda pesunathula sorry sonadhu dha athigam",
  "Now we are in last year...Unkuda chat la dha pesiruken.. but nerla 1 minutes kuda full ah pesunathu ila... Seri adha unkuda one last time ah pesalam nu kupten...adhuvum na bayandhuttu dha una kupta...first time na yaru kittayum ipdi ketadhum pesunathum illa..na clg la First pesuna girl ne mattum dha...na adha marakave matten...Ne dha busy vara mudiyathu nu sollita...enaku kjm kastama dha irundhuchu.. it's ok that's my luck.. i respected your situation or whatever...... ♡"
];

export const StageMessage: React.FC<StageMessageProps> = ({ config, onProceed }) => {
  const letterConfig = config.letterForYou;
  const envelopeTitle = letterConfig?.envelopeTitle ?? "A Letter I've Been Meaning to Give You";
  const envelopeSubtitle = letterConfig?.envelopeSubtitle ?? "Some memories are too precious to leave unspoken...";
  const envelopeInstruction = letterConfig?.envelopeInstruction ?? "Untie the little ribbon to open your letter";
  const envelopeTag = letterConfig?.envelopeTag ?? "Made with care, just for you.";

  const page1List = letterConfig?.page1Paragraphs?.length ? letterConfig.page1Paragraphs : DEFAULT_PAGE_1_PARAGRAPHS;
  const page2List = letterConfig?.page2Paragraphs?.length ? letterConfig.page2Paragraphs : DEFAULT_PAGE_2_PARAGRAPHS;
  const page3List = letterConfig?.page3Paragraphs?.length ? letterConfig.page3Paragraphs : DEFAULT_PAGE_3_PARAGRAPHS;
  const buttonText = letterConfig?.buttonText ?? "One Last Surprise ✨";

  // State management: 3-page flipbook
  const [envelopeState, setEnvelopeState] = useState<EnvelopeState>('sealed');
  const [currentPage, setCurrentPage] = useState<1 | 2 | 3>(1);
  const [isFlipping, setIsFlipping] = useState<boolean>(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const [flipPhase, setFlipPhase] = useState<'idle' | 'flipping-out' | 'flipping-in'>('idle');
  const [isReadingWithLove, setIsReadingWithLove] = useState<boolean>(false);

  // Drag interaction physics
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Ensure Memories background music continues seamlessly through the letter
  useEffect(() => {
    memoryAudioController.resume();
  }, []);

  // Trigger opening sequence smoothly
  const triggerOpenSequence = () => {
    if (envelopeState !== 'sealed' && envelopeState !== 'dragging') return;
    setEnvelopeState('untying');

    // 1. Untie bow & slide away ribbon
    setTimeout(() => {
      setEnvelopeState('opening');

      // 2. Open top flap in 3D
      setTimeout(() => {
        setEnvelopeState('rising');

        // 3. Letter slides up out of envelope pocket
        setTimeout(() => {
          setEnvelopeState('letter-view');
        }, 650);
      }, 500);
    }, 450);
  };

  // Pointer drag event handlers for rope/bow
  const handlePointerDown = (e: React.PointerEvent) => {
    if (envelopeState !== 'sealed') return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if pointer capture isn't permitted
    }
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setEnvelopeState('dragging');
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    // Apply gentle damping to bow movement
    setDragOffset({ x: dx * 0.42, y: dy * 0.42 });
    setDragDistance(dist);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // If dragged sufficiently (> 55px), trigger untie and open!
    if (dragDistance >= 55) {
      triggerOpenSequence();
    } else {
      // Rebound with smooth spring back
      setDragOffset({ x: 0, y: 0 });
      setDragDistance(0);
      setEnvelopeState('sealed');
    }
  };

  // Flipbook Page Turns: 3D perspective flip between Pages 1, 2, and 3
  const handleTurnToPage = (targetPage: 1 | 2 | 3, direction: 'next' | 'prev') => {
    if (isFlipping || targetPage === currentPage) return;
    setIsFlipping(true);
    setFlipDirection(direction);
    setFlipPhase('flipping-out');

    // Midpoint: switch content when rotated edge-on (320ms)
    setTimeout(() => {
      setCurrentPage(targetPage);
      setFlipPhase('flipping-in');

      // Settle into view (640ms total)
      setTimeout(() => {
        setIsFlipping(false);
        setFlipPhase('idle');
      }, 320);
    }, 320);
  };

  const handleNextPage = () => {
    if (currentPage === 1) handleTurnToPage(2, 'next');
    else if (currentPage === 2) handleTurnToPage(3, 'next');
  };

  const handlePrevPage = () => {
    if (currentPage === 3) handleTurnToPage(2, 'prev');
    else if (currentPage === 2) handleTurnToPage(1, 'prev');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (envelopeState === 'sealed' || envelopeState === 'dragging') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerOpenSequence();
        }
      } else if (envelopeState === 'letter-view' && !isFlipping) {
        if (currentPage < 3 && (e.key === 'ArrowRight' || e.key === 'PageDown')) {
          e.preventDefault();
          handleNextPage();
        } else if (currentPage > 1 && (e.key === 'ArrowLeft' || e.key === 'PageUp')) {
          e.preventDefault();
          handlePrevPage();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [envelopeState, currentPage, isFlipping]);

  // Highlight key emotional phrases seamlessly while preserving 100% of the sentences verbatim
  const renderFormattedText = (text: string) => {
    const phrasesToHighlight = [
      '25 September 2024',
      'avlo crowd la kuda ne mattum thaniya therinja....',
      'you look so pretty on that day...',
      'sweetest day of my first year',
      'First pesuna girl ne mattum dha...na adha marakave matten...',
      "beautiful memories... I'll always carry in my heart..",
    ];

    const escaped = phrasesToHighlight.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped}|😂|♡|❤️)`, 'g');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (phrasesToHighlight.includes(part)) {
        return (
          <em key={index} className="letter-highlight-phrase">
            {part}
          </em>
        );
      }
      if (part === '😂') {
        return (
          <span key={index} className="letter-emoji-laugh" role="img" aria-label="laughing emoji">
            😂
          </span>
        );
      }
      if (part === '♡') {
        return (
          <span key={index} className="letter-heart-symbol" role="img" aria-label="heart">
            ♡
          </span>
        );
      }
      if (part === '❤️') {
        return (
          <span key={index} className="letter-heart-emoji" role="img" aria-label="heart">
            ❤️
          </span>
        );
      }
      return part;
    });
  };

  // Center knot coordinates for bow
  const knotX = 220 + dragOffset.x;
  const knotY = 155 + dragOffset.y;

  return (
    <div className="stage-container romantic-letter-stage" role="region" aria-label="Interactive Romantic Letter Experience">
      {/* Gentle Floating Atmospheric Particles */}
      <div className="letter-ambient-backdrop" aria-hidden="true">
        <div className="ambient-spotlight" />
        <span className="drifting-feather df-1">✦</span>
        <span className="drifting-feather df-2">♡</span>
        <span className="drifting-feather df-3">✨</span>
        <span className="drifting-feather df-4">🌸</span>
      </div>

      {/* =========================================================================
          PHASE 1: THE SEALED ENVELOPE (Accurately matching reference image)
          ========================================================================= */}
      {envelopeState !== 'letter-view' && (
        <div className={`sealed-envelope-scene ${envelopeState !== 'sealed' && envelopeState !== 'dragging' ? 'envelope-opening-phase' : ''}`}>
          {/* Header Above Envelope */}
          <header className="envelope-intro-header">
            <h1 className="envelope-main-title gold-gradient-text">
              {envelopeTitle}
            </h1>
            <p className="envelope-sub-title">
              {envelopeSubtitle}
            </p>
          </header>

          {/* Interactive Envelope Graphic */}
          <div
            className={`envelope-wrapper ${isDragging ? 'is-dragging-bow' : ''}`}
            tabIndex={0}
            role="button"
            aria-label="Sealed pink envelope with bow. Drag ribbon to untie or press Enter to open."
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                triggerOpenSequence();
              }
            }}
          >
            {/* The SVG Envelope & Bow matching reference image */}
            <div className="envelope-container-box">
              {/* Emerging Letter Preview when opening */}
              {(envelopeState === 'opening' || envelopeState === 'rising') && (
                <div className={`folded-letter-preview ${envelopeState === 'rising' ? 'letter-rising-up' : ''}`}>
                  <div className="preview-paper-top" />
                  <div className="preview-heart-stamp">♡</div>
                </div>
              )}

              <svg
                viewBox="0 0 440 310"
                className="envelope-svg-graphic"
                aria-hidden="true"
              >
                {/* Envelope Base Shadow */}
                <rect x="8" y="8" width="424" height="294" rx="6" fill="rgba(80, 25, 40, 0.35)" filter="blur(6px)" />

                {/* Envelope Back Base */}
                <rect x="0" y="0" width="440" height="310" rx="4" fill="#F4B7BF" stroke="#5A311A" stroke-width="1.8" />

                {/* Left Triangular Flap */}
                <polygon points="0,0 220,155 0,310" fill="#EFAEB6" stroke="#5A311A" stroke-width="1.8" />

                {/* Right Triangular Flap with subtle paper depth */}
                <polygon points="440,0 220,155 440,310" fill="#E79DA7" stroke="#5A311A" stroke-width="1.8" />

                {/* Organic curved shadow on right side matching reference */}
                <path d="M 440,165 Q 310,230 380,310 L 440,310 Z" fill="rgba(195, 105, 120, 0.28)" />

                {/* Bottom Triangular Flap */}
                <polygon points="0,310 220,155 440,310" fill="#DE909B" stroke="#5A311A" stroke-width="1.8" />

                {/* Top Triangular Flap (Flips open during sequence) */}
                {envelopeState !== 'opening' && envelopeState !== 'rising' ? (
                  <polygon points="0,0 440,0 220,155" fill="#F6BDC4" stroke="#5A311A" stroke-width="1.8" />
                ) : (
                  // Open Top Flap rotated upwards
                  <polygon points="0,0 440,0 220,-140" fill="#F2ABB4" stroke="#5A311A" stroke-width="1.8" />
                )}

                {/* Vertical Tied String (Flexes organically when dragged) */}
                {envelopeState !== 'untying' && envelopeState !== 'opening' && envelopeState !== 'rising' && (
                  <g className="envelope-vertical-rope">
                    {/* Top segment of rope */}
                    <path
                      d={`M 220,0 Q ${220 + dragOffset.x * 0.45},${75 + dragOffset.y * 0.45} ${knotX},${knotY}`}
                      stroke="#5A311A"
                      strokeWidth="2.4"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Bottom segment of rope */}
                    <path
                      d={`M ${knotX},${knotY} Q ${220 + dragOffset.x * 0.45},${235 + dragOffset.y * 0.45} 220,310`}
                      stroke="#5A311A"
                      strokeWidth="2.4"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>
                )}

                {/* The Tied Ribbon Bow (Loops and Tails) */}
                {envelopeState !== 'untying' && envelopeState !== 'opening' && envelopeState !== 'rising' && (
                  <g className="envelope-bow-group">
                    {/* Left Loop */}
                    <path
                      d={`M ${knotX},${knotY} C ${knotX - 38 + dragOffset.x * 0.2},${knotY - 42 + dragOffset.y * 0.2} ${knotX - 70 + dragOffset.x * 0.35},${knotY - 14 + dragOffset.y * 0.3} ${knotX - 48 + dragOffset.x * 0.25},${knotY + 12 + dragOffset.y * 0.2} C ${knotX - 32 + dragOffset.x * 0.15},${knotY + 24} ${knotX - 10},${knotY + 10} ${knotX},${knotY}`}
                      stroke="#5A311A"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Right Loop */}
                    <path
                      d={`M ${knotX},${knotY} C ${knotX + 38 + dragOffset.x * 0.2},${knotY - 42 + dragOffset.y * 0.2} ${knotX + 70 + dragOffset.x * 0.35},${knotY - 14 + dragOffset.y * 0.3} ${knotX + 48 + dragOffset.x * 0.25},${knotY + 12 + dragOffset.y * 0.2} C ${knotX + 32 + dragOffset.x * 0.15},${knotY + 24} ${knotX + 10},${knotY + 10} ${knotX},${knotY}`}
                      stroke="#5A311A"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {/* Left Tail */}
                    <path
                      d={`M ${knotX},${knotY} C ${knotX - 12 + dragOffset.x * 0.25},${knotY + 28 + dragOffset.y * 0.25} ${knotX - 26 + dragOffset.x * 0.35},${knotY + 52 + dragOffset.y * 0.35} ${knotX - 32 + dragOffset.x * 0.4},${knotY + 76 + dragOffset.y * 0.4}`}
                      stroke="#5A311A"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Right Tail */}
                    <path
                      d={`M ${knotX},${knotY} C ${knotX + 12 + dragOffset.x * 0.25},${knotY + 28 + dragOffset.y * 0.25} ${knotX + 22 + dragOffset.x * 0.35},${knotY + 52 + dragOffset.y * 0.35} ${knotX + 28 + dragOffset.x * 0.4},${knotY + 76 + dragOffset.y * 0.4}`}
                      stroke="#5A311A"
                      strokeWidth="2.2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    {/* Center Knot Circle */}
                    <circle cx={knotX} cy={knotY} r="5.2" fill="#5A311A" />
                  </g>
                )}
              </svg>

              {/* Physical Draggable Touch / Mouse Hit Area over the bow */}
              {envelopeState === 'sealed' || envelopeState === 'dragging' ? (
                <div
                  className="rope-drag-hitbox"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  title="Click and drag to untie the ribbon"
                  style={{
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  }}
                >
                  <div className="hitbox-sparkle-indicator">
                    <Heart size={14} className="drag-hint-heart" />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Instruction Beneath Envelope */}
            <div className="envelope-footer-instructions">
              <p className="instruction-primary">
                <span className="hand-drag-icon">👆</span> {isDragging ? 'Keep pulling to untie…' : envelopeInstruction}
              </p>
              <div className="care-tag-badge">
                <span className="care-tag-heart">♡</span>
                <span>{envelopeTag}</span>
              </div>
            </div>

            {/* Accessible Button for keyboard or single-click users */}
            <div className="accessible-open-control">
              <button
                type="button"
                onClick={triggerOpenSequence}
                className="btn-ghost open-letter-direct-btn"
                aria-label="Open the letter directly"
              >
                <Mail size={16} />
                <span>Open the letter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 2: THE PHYSICAL THREE-PAGE FLIPBOOK LETTER
          ========================================================================= */}
      {envelopeState === 'letter-view' && (
        <div className={`two-page-letter-card ${isReadingWithLove ? 'reading-with-love-active' : ''}`}>
          {/* Top Header Utilities: Quick Turn, Page Indicator, "Read with Love" Toggle */}
          <div className="letter-top-utility-bar">
            <div className="utility-bar-left">
              {currentPage > 1 && (
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={isFlipping}
                  className="quick-page-nav-btn prev-btn"
                  aria-label={`Previous Page: Page ${currentPage - 1}`}
                  title={`Return to Page ${currentPage - 1}`}
                >
                  <ArrowLeft size={14} />
                  <span>Previous Page</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReadingWithLove((prev) => !prev)}
                className={`read-with-love-btn ${isReadingWithLove ? 'is-active' : ''}`}
                aria-pressed={isReadingWithLove}
                aria-label={isReadingWithLove ? 'Candlelight atmosphere active' : 'Activate warm candlelight atmosphere'}
                title="Toggle warm candlelight reading atmosphere"
              >
                <Heart size={14} className={`love-btn-icon ${isReadingWithLove ? 'fill-rose text-rose' : ''}`} />
                <span>{isReadingWithLove ? 'Candlelight ♡' : 'Candlelight'}</span>
              </button>
            </div>

            <div className="utility-bar-right">
              <div className="flipbook-page-counter" aria-live="polite">
                <span className="counter-pill">
                  PAGE {currentPage} OF 3
                </span>
              </div>
              {currentPage < 3 && (
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={isFlipping}
                  className="quick-page-nav-btn next-btn"
                  aria-label={`Next Page: Page ${currentPage + 1}`}
                  title={`Turn to Page ${currentPage + 1}`}
                >
                  <span>Next Page</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Flipbook 3D Stage Container */}
          <div className={`flipbook-viewport flip-phase-${flipPhase} flip-dir-${flipDirection}`}>
            {/* PAGE 1: FRONT OF THE LETTER (First Year Memories Only) */}
            {currentPage === 1 && (
              <div
                className="letter-page-surface page-1-surface"
                role="article"
                aria-label="Page 1 of 3: First Year Memories"
              >
                <div className="page-inner-border" aria-hidden="true">
                  <span className="corner-accent tl">✦</span>
                  <span className="corner-accent tr">✦</span>
                  <span className="corner-accent bl">✦</span>
                  <span className="corner-accent br">✦</span>
                </div>

                <div className="page-content-wrapper">
                  <header className="page-header">
                    <h2 className="letter-book-title gold-gradient-text">
                      {envelopeTitle}
                    </h2>
                    <p className="letter-book-subtitle">
                      {envelopeSubtitle}
                    </p>
                    <div className="page-divider" aria-hidden="true">
                      <span className="divider-line" />
                      <span className="divider-icon">❦</span>
                      <span className="divider-line" />
                    </div>
                  </header>

                  <div className="letter-paragraphs-column">
                    {page1List.map((para, idx) => (
                      <p key={idx} className={`letter-text-para ${idx === 0 ? 'drop-cap-paragraph' : ''}`}>
                        {renderFormattedText(para)}
                      </p>
                    ))}
                  </div>

                  {/* Page 1 Bottom Turn Prompt */}
                  <footer className="page-bottom-action-bar">
                    <p className="turn-page-whisper">
                      There's more to my story… turn the page 💗
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTurnToPage(2, 'next')}
                      disabled={isFlipping}
                      className="btn-cinematic turn-page-button"
                      aria-label="Turn to Page 2"
                    >
                      <span>Next Page</span>
                      <ArrowRight size={17} />
                    </button>
                  </footer>
                </div>
              </div>
            )}

            {/* PAGE 2: MIDDLE OF THE LETTER (Second Year Memories Only) */}
            {currentPage === 2 && (
              <div
                className="letter-page-surface page-2-surface"
                role="article"
                aria-label="Page 2 of 3: Second Year Memories"
              >
                <div className="page-inner-border" aria-hidden="true">
                  <span className="corner-accent tl">✦</span>
                  <span className="corner-accent tr">✦</span>
                  <span className="corner-accent bl">✦</span>
                  <span className="corner-accent br">✦</span>
                </div>

                <div className="page-content-wrapper">
                  <header className="page-header page-2-header">
                    <span className="continuation-pill">Second Year Memories · The Story Continues…</span>
                    <div className="page-divider" aria-hidden="true">
                      <span className="divider-line" />
                      <span className="divider-icon">♡</span>
                      <span className="divider-line" />
                    </div>
                  </header>

                  <div className="letter-paragraphs-column">
                    {page2List.map((para, idx) => (
                      <p key={idx} className="letter-text-para">
                        {renderFormattedText(para)}
                      </p>
                    ))}
                  </div>

                  {/* Page 2 Bottom Navigation Actions */}
                  <footer className="page-multi-actions-row">
                    <button
                      type="button"
                      onClick={() => handleTurnToPage(1, 'prev')}
                      disabled={isFlipping}
                      className="btn-ghost back-page-btn"
                      aria-label="Return to Page 1"
                    >
                      <ArrowLeft size={16} />
                      <span>Previous Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTurnToPage(3, 'next')}
                      disabled={isFlipping}
                      className="btn-cinematic turn-page-button"
                      aria-label="Turn to Page 3"
                    >
                      <span>Next Page</span>
                      <ArrowRight size={17} />
                    </button>
                  </footer>
                </div>
              </div>
            )}

            {/* PAGE 3: CONCLUSION OF THE LETTER (Third Year & Final Year Memories) */}
            {currentPage === 3 && (
              <div
                className="letter-page-surface page-3-surface"
                role="article"
                aria-label="Page 3 of 3: Third Year and Final Year Memories"
              >
                <div className="page-inner-border" aria-hidden="true">
                  <span className="corner-accent tl">✦</span>
                  <span className="corner-accent tr">✦</span>
                  <span className="corner-accent bl">✦</span>
                  <span className="corner-accent br">✦</span>
                </div>

                <div className="page-content-wrapper">
                  <header className="page-header page-3-header">
                    <span className="continuation-pill">Third Year & Final Year · Always in My Heart</span>
                    <div className="page-divider" aria-hidden="true">
                      <span className="divider-line" />
                      <span className="divider-icon">♡</span>
                      <span className="divider-line" />
                    </div>
                  </header>

                  <div className="letter-paragraphs-column page-3-paragraphs">
                    {page3List.map((para, idx) => (
                      <p key={idx} className="letter-text-para">
                        {renderFormattedText(para)}
                      </p>
                    ))}
                  </div>

                  {/* Page 3 Bottom Navigation Actions */}
                  <footer className="page-multi-actions-row">
                    <button
                      type="button"
                      onClick={() => handleTurnToPage(2, 'prev')}
                      disabled={isFlipping}
                      className="btn-ghost back-page-btn"
                      aria-label="Return to Page 2"
                    >
                      <ArrowLeft size={16} />
                      <span>Previous Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={onProceed}
                      className="btn-cinematic proceed-surprise-btn"
                      aria-label="Proceed to Next Slide: 21st Celebration"
                    >
                      <span>{buttonText}</span>
                    </button>
                  </footer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .romantic-letter-stage {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px 18px 95px 18px;
          min-height: 100vh;
          width: 100vw;
          position: relative;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .letter-ambient-backdrop {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .ambient-spotlight {
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: clamp(340px, 50vw, 680px);
          height: clamp(340px, 50vw, 680px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(239, 195, 202, 0.25) 0%, rgba(250, 169, 67, 0.1) 50%, transparent 75%);
          filter: blur(55px);
        }

        .drifting-feather {
          position: absolute;
          color: var(--color-primary);
          opacity: 0.35;
          animation: floatFeather 13s linear infinite;
        }

        .df-1 { left: 8%; bottom: -30px; font-size: 1.2rem; animation-delay: 0s; }
        .df-2 { left: 88%; bottom: -30px; font-size: 1.4rem; animation-delay: 3s; }
        .df-3 { left: 18%; bottom: -30px; font-size: 1.1rem; animation-delay: 6.5s; color: var(--color-secondary-peach); }
        .df-4 { left: 82%; bottom: -30px; font-size: 1.3rem; animation-delay: 9.5s; }

        @keyframes floatFeather {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          15% { opacity: 0.35; }
          85% { opacity: 0.35; }
          100% { transform: translateY(-110vh) rotate(40deg); opacity: 0; }
        }

        /* =========================================================================
           ENVELOPE SCENE STYLING (Accurately recreating reference image)
           ========================================================================= */
        .sealed-envelope-scene {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: envelopeEnter 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          max-width: 580px;
          width: 100%;
        }

        @keyframes envelopeEnter {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(22px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .envelope-intro-header {
          margin-bottom: 22px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .envelope-main-title {
          font-family: var(--font-serif);
          font-size: clamp(2.1rem, 4.6vw, 3.1rem);
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.25;
          margin: 0;
          text-shadow: 0 0 35px rgba(239, 195, 202, 0.45);
        }

        .envelope-sub-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: clamp(1.1rem, 2.3vw, 1.35rem);
          color: var(--color-secondary);
          margin: 0;
          letter-spacing: 0.015em;
        }

        /* Envelope Box */
        .envelope-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          outline: none;
        }

        .envelope-container-box {
          position: relative;
          width: clamp(310px, 86vw, 450px);
          height: clamp(218px, 60vw, 316px);
          margin: 0 auto;
          user-select: none;
          -webkit-user-select: none;
        }

        .envelope-svg-graphic {
          width: 100%;
          height: 100%;
          overflow: visible;
          filter: drop-shadow(0 14px 30px rgba(0, 0, 0, 0.55));
        }

        /* Folded Letter Emerging Preview */
        .folded-letter-preview {
          position: absolute;
          top: 15px;
          left: 5%;
          width: 90%;
          height: 75%;
          background: #FFFDF9;
          border: 1px solid rgba(221, 167, 176, 0.6);
          border-radius: 4px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 1;
          transition: transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .letter-rising-up {
          transform: translateY(-90px) scale(1.02);
        }

        .preview-paper-top {
          width: 75%;
          height: 2px;
          background: rgba(221, 167, 176, 0.45);
          margin-bottom: 8px;
        }

        .preview-heart-stamp {
          font-size: 1.4rem;
          color: #BA465A;
        }

        /* Draggable Hitbox around Bow */
        .rope-drag-hitbox {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 120px;
          height: 120px;
          margin-top: -60px;
          margin-left: -60px;
          cursor: grab;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          touch-action: none;
          transition: transform 0.15s ease-out;
        }

        .rope-drag-hitbox:active {
          cursor: grabbing;
        }

        .hitbox-sparkle-indicator {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(250, 169, 67, 0.16);
          border: 1px dashed rgba(250, 169, 67, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulseHitbox 2.2s infinite ease-in-out;
        }

        .drag-hint-heart {
          color: #BA465A;
          fill: rgba(186, 70, 90, 0.2);
        }

        @keyframes pulseHitbox {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.22); opacity: 1; }
        }

        .envelope-footer-instructions {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .instruction-primary {
          font-family: var(--font-sans);
          font-size: 0.96rem;
          font-weight: 600;
          color: var(--color-secondary-peach, #FAA943);
          letter-spacing: 0.02em;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hand-drag-icon {
          animation: dragWiggle 1.8s ease-in-out infinite;
        }

        @keyframes dragWiggle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        .care-tag-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 14px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.1);
          border: 1px solid var(--color-border-subtle);
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 0.85rem;
          color: var(--color-secondary);
        }

        .care-tag-heart {
          color: #FAA943;
        }

        .accessible-open-control {
          margin-top: 14px;
        }

        .open-letter-direct-btn {
          font-size: 0.82rem;
          padding: 7px 18px;
          border-color: rgba(221, 167, 176, 0.4);
        }

        /* =========================================================================
           THREE-PAGE FLIPBOOK LETTER STYLING (EXPANDED & ZERO SCROLLING)
           ========================================================================= */
        .two-page-letter-card {
          position: relative;
          z-index: 3;
          max-width: min(960px, 94vw);
          width: 100%;
          min-height: 520px;
          height: auto;
          display: flex;
          flex-direction: column;
          background: radial-gradient(130% 120% at 50% 0%, #FFFFFF 0%, #FAF4ED 55%, #F4E8DC 100%);
          border: 1px solid rgba(221, 167, 176, 0.65);
          border-radius: 26px;
          box-shadow: 0 30px 95px rgba(0, 0, 0, 0.85), 0 0 50px rgba(239, 195, 202, 0.22);
          animation: letterCardSettle 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          overflow: visible;
          transition: box-shadow 0.4s ease, background 0.4s ease;
        }

        .two-page-letter-card.reading-with-love-active {
          background: radial-gradient(130% 120% at 50% 0%, #FFFDF8 0%, #FCF5EB 55%, #F7ECE0 100%);
          border-color: rgba(250, 169, 67, 0.65);
          box-shadow: 0 35px 100px rgba(0, 0, 0, 0.85), 0 0 70px rgba(250, 169, 67, 0.3), 0 0 35px rgba(239, 195, 202, 0.35);
        }

        @keyframes letterCardSettle {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(18px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Top Utility Bar */
        .letter-top-utility-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px 12px 28px;
          border-bottom: 1px solid rgba(221, 167, 176, 0.35);
          background: rgba(255, 255, 255, 0.4);
          border-radius: 26px 26px 0 0;
        }

        .utility-bar-left,
        .utility-bar-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .quick-page-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.22);
          border: 1px solid rgba(221, 167, 176, 0.6);
          font-family: var(--font-sans);
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: #7A3548;
          cursor: pointer;
          transition: all 0.25s ease;
          outline: none;
        }

        .quick-page-nav-btn:hover:not(:disabled) {
          background: rgba(239, 195, 202, 0.42);
          color: #5A2030;
          transform: translateY(-1px);
        }

        .quick-page-nav-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .read-with-love-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 9999px;
          background: rgba(239, 195, 202, 0.18);
          border: 1px solid rgba(221, 167, 176, 0.6);
          font-family: var(--font-sans);
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: #7A3548;
          cursor: pointer;
          transition: all 0.28s ease;
          outline: none;
        }

        .read-with-love-btn:hover {
          background: rgba(239, 195, 202, 0.35);
          color: #5A2030;
          transform: translateY(-1px);
        }

        .read-with-love-btn.is-active {
          background: linear-gradient(135deg, rgba(239, 195, 202, 0.35) 0%, rgba(250, 169, 67, 0.25) 100%);
          border-color: #FAA943;
          color: #6A2234;
          box-shadow: 0 0 14px rgba(250, 169, 67, 0.35);
        }

        .flipbook-page-counter .counter-pill {
          font-family: var(--font-sans);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #8C475A;
          padding: 4px 12px;
          background: rgba(239, 195, 202, 0.15);
          border-radius: 9999px;
          border: 1px solid rgba(221, 167, 176, 0.4);
        }

        /* 3D Flip Viewport with realistic perspective */
        .flipbook-viewport {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: visible;
          perspective: 2000px;
          transform-style: preserve-3d;
        }

        /* Page Turn 3D Animation: Two-phase seamless flip */
        .flip-phase-flipping-out.flip-dir-next .letter-page-surface {
          animation: flipOutToNext 0.32s cubic-bezier(0.4, 0, 0.7, 1) forwards;
        }

        .flip-phase-flipping-in.flip-dir-next .letter-page-surface {
          animation: flipInFromNext 0.32s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }

        .flip-phase-flipping-out.flip-dir-prev .letter-page-surface {
          animation: flipOutToPrev 0.32s cubic-bezier(0.4, 0, 0.7, 1) forwards;
        }

        .flip-phase-flipping-in.flip-dir-prev .letter-page-surface {
          animation: flipInFromPrev 0.32s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }

        @keyframes flipOutToNext {
          0% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
            opacity: 1;
            filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.08));
          }
          100% {
            transform: perspective(2000px) rotateY(-86deg) scale(0.96);
            opacity: 0.15;
            filter: drop-shadow(-18px 8px 24px rgba(0, 0, 0, 0.3));
          }
        }

        @keyframes flipInFromNext {
          0% {
            transform: perspective(2000px) rotateY(86deg) scale(0.96);
            opacity: 0.15;
            filter: drop-shadow(18px 8px 24px rgba(0, 0, 0, 0.3));
          }
          100% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
            opacity: 1;
            filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.08));
          }
        }

        @keyframes flipOutToPrev {
          0% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
            opacity: 1;
            filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.08));
          }
          100% {
            transform: perspective(2000px) rotateY(86deg) scale(0.96);
            opacity: 0.15;
            filter: drop-shadow(18px 8px 24px rgba(0, 0, 0, 0.3));
          }
        }

        @keyframes flipInFromPrev {
          0% {
            transform: perspective(2000px) rotateY(-86deg) scale(0.96);
            opacity: 0.15;
            filter: drop-shadow(-18px 8px 24px rgba(0, 0, 0, 0.3));
          }
          100% {
            transform: perspective(2000px) rotateY(0deg) scale(1);
            opacity: 1;
            filter: drop-shadow(0 4px 14px rgba(0, 0, 0, 0.08));
          }
        }

        /* Page Surface (Expanded, visible overflow, no scrollbars) */
        .letter-page-surface {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 26px 36px 30px 36px;
          overflow: visible;
          transform-origin: center center;
          backface-visibility: hidden;
          will-change: transform, opacity;
          border-radius: 0 0 26px 26px;
        }

        .page-inner-border {
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(221, 167, 176, 0.35);
          border-radius: 18px;
          pointer-events: none;
          z-index: 1;
        }

        .corner-accent {
          position: absolute;
          font-size: 0.7rem;
          color: rgba(186, 70, 90, 0.45);
        }

        .corner-accent.tl { top: 6px; left: 8px; }
        .corner-accent.tr { top: 6px; right: 8px; }
        .corner-accent.bl { bottom: 6px; left: 8px; }
        .corner-accent.br { bottom: 6px; right: 8px; }

        /* Full-flow content wrapper: no scrollbars, natural responsive layout */
        .page-content-wrapper {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: visible;
        }

        .page-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 20px;
          gap: 6px;
        }

        .page-2-header,
        .page-3-header {
          margin-bottom: 16px;
        }

        .continuation-pill {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 0.95rem;
          color: #8C475A;
          letter-spacing: 0.05em;
        }

        .letter-book-title {
          font-family: var(--font-serif);
          font-size: clamp(1.8rem, 3.8vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.015em;
          line-height: 1.25;
          margin: 0;
          color: #2D1420;
          text-shadow: 0 1px 2px rgba(250, 169, 67, 0.15);
        }

        .letter-book-subtitle {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: clamp(1.02rem, 2vw, 1.22rem);
          font-weight: 500;
          color: #7E3E50;
          margin: 0;
        }

        .page-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          max-width: 320px;
          margin-top: 6px;
        }

        .page-divider .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(221, 167, 176, 0.65), transparent);
        }

        .page-divider .divider-icon {
          color: #BA465A;
          font-size: 0.95rem;
        }

        .letter-paragraphs-column {
          display: flex;
          flex-direction: column;
          gap: 18px;
          text-align: left;
        }

        .letter-text-para {
          font-family: 'Cormorant Garamond', 'Playfair Display', Georgia, serif;
          font-size: clamp(1.02rem, 1.35vw, 1.15rem);
          line-height: 1.82;
          color: #2D1722;
          font-weight: 500;
          margin: 0;
          letter-spacing: 0.012em;
        }

        /* Dedicated typographic tuning for Page 3 so both paragraphs fit comfortably without scrolling */
        .page-3-surface .page-content-wrapper .page-3-paragraphs {
          gap: 12px;
        }

        .page-3-surface .page-3-paragraphs .letter-text-para {
          font-size: clamp(0.96rem, 1.22vw, 1.06rem);
          line-height: 1.7;
        }

        .drop-cap-paragraph::first-letter {
          font-family: var(--font-serif);
          font-size: 2.1em;
          line-height: 0.85;
          float: left;
          margin-right: 8px;
          margin-top: 4px;
          color: #9C334E;
          font-weight: 700;
        }

        /* Selective Italic & Rose-Gold/Peach Highlighted Phrases */
        .letter-highlight-phrase {
          font-style: italic;
          font-weight: 600;
          color: #9C334E;
          background: linear-gradient(180deg, transparent 62%, rgba(250, 169, 67, 0.22) 62%);
          padding: 0 4px;
          border-radius: 3px;
        }

        .reading-with-love-active .letter-highlight-phrase {
          background: linear-gradient(180deg, transparent 58%, rgba(250, 169, 67, 0.38) 58%);
          color: #8C243E;
        }

        .letter-heart-emoji {
          display: inline-block;
          margin-left: 4px;
        }

        .letter-emoji-laugh {
          font-family: 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji', sans-serif;
          font-style: normal;
          font-size: 1.15em;
          display: inline-block;
          vertical-align: -0.08em;
          margin: 0 2px;
        }

        .letter-heart-symbol {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: normal;
          font-weight: 700;
          font-size: 1.35em;
          color: #C0435C;
          display: inline-block;
          vertical-align: -0.05em;
          margin-left: 4px;
        }

        /* Page 1 Bottom Turn Prompt */
        .page-bottom-action-bar {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(221, 167, 176, 0.35);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }

        .turn-page-whisper {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-style: italic;
          font-size: 1.05rem;
          color: #8C475A;
          margin: 0;
        }

        .turn-page-button {
          font-size: 1rem;
          padding: 12px 34px;
        }

        /* Multi-action bar for Pages 2 and 3 */
        .page-multi-actions-row {
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid rgba(221, 167, 176, 0.35);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .back-page-btn {
          font-size: 0.92rem;
          padding: 11px 22px;
          border-color: rgba(221, 167, 176, 0.6);
          color: #7A3548;
        }

        .proceed-surprise-btn {
          font-size: 1rem;
          padding: 12px 32px;
        }

        /* Responsive Styles: Complete visibility without internal scrollbar */
        @media (max-width: 640px) {
          .romantic-letter-stage {
            padding: 20px 10px 85px 10px;
          }
          .envelope-intro-header {
            margin-bottom: 16px;
          }
          .two-page-letter-card {
            border-radius: 20px;
            max-width: 98vw;
            min-height: auto;
          }
          .letter-page-surface {
            padding: 18px 14px 20px 14px;
            border-radius: 0 0 20px 20px;
          }
          .letter-top-utility-bar {
            padding: 12px 14px 10px 14px;
            border-radius: 20px 20px 0 0;
          }
          .page-inner-border {
            inset: 6px;
          }
          .turn-page-button,
          .proceed-surprise-btn,
          .back-page-btn {
            width: 100%;
            justify-content: center;
          }
          .page-multi-actions-row {
            flex-direction: column-reverse;
            gap: 10px;
          }
          .letter-text-para {
            font-size: 0.98rem;
            line-height: 1.68;
          }
          .page-3-surface .page-3-paragraphs .letter-text-para {
            font-size: 0.92rem;
            line-height: 1.6;
          }
        }

        /* Reduced Motion Compliance */
        @media (prefers-reduced-motion: reduce) {
          .sealed-envelope-scene,
          .drifting-feather,
          .hand-drag-icon,
          .hitbox-sparkle-indicator,
          .flip-phase-flipping-out .letter-page-surface,
          .flip-phase-flipping-in .letter-page-surface {
            animation: none !important;
            transition: opacity 0.22s ease !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StageMessage;
