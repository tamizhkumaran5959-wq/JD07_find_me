import React, { useState, useRef, useEffect } from 'react';
import type { BirthdayStage } from './types';
import { birthdayConfig } from './config/birthdayConfig';
import { AmbientBackground } from './components/AmbientBackground';
import { AudioPlayer } from './components/AudioPlayer';
import { StageInvitation } from './components/StageInvitation';
import { StageAgeReveal } from './components/StageAgeReveal';
import { StageGallery } from './components/StageGallery';
import { StageSurpriseGift } from './components/StageSurpriseGift';
import { StageMessage } from './components/StageMessage';
import { StageCelebration } from './components/StageCelebration';
import { StageFinalReveal } from './components/StageFinalReveal';
import { memoryAudioController } from './utils/memoryAudioController';
import { celebrationAudioController } from './utils/celebrationAudioController';

export const App: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<BirthdayStage>('invitation');
  const [musicStarted, setMusicStarted] = useState<boolean>(false);
  const [hasEnteredMemoryTab, setHasEnteredMemoryTab] = useState<boolean>(false);
  const lastTransitionTime = useRef<number>(0);

  // Persistent soundtrack lifecycle: First entry into the Memory tab pauses opening song
  useEffect(() => {
    if (currentStage === 'gallery') {
      if (!hasEnteredMemoryTab) {
        setHasEnteredMemoryTab(true);
        // StageGallery's opening train video timeline will trigger startMemoryBgm() at 12s
      } else {
        // Subsequent navigation: continue BGM if not already playing
        memoryAudioController.startMemoryBgm();
      }
    }
  }, [currentStage, hasEnteredMemoryTab]);

  // Guard against accidental double-transitions from rapid keypresses
  const safeSetStage = (stage: BirthdayStage) => {
    const now = Date.now();
    if (now - lastTransitionTime.current < 400) return;
    lastTransitionTime.current = now;

    const celebrationDomainStages: BirthdayStage[] = ['celebration', 'final-reveal'];
    const isTargetCelebrationDomain = celebrationDomainStages.includes(stage);
    const isCurrentCelebrationDomain = celebrationDomainStages.includes(currentStage);

    // 1. Moving from earlier stages into Celebration or Final Words:
    if (isTargetCelebrationDomain && !isCurrentCelebrationDomain) {
      memoryAudioController.pause(false);
      celebrationAudioController.start();
    }
    // 2. Moving between Celebration and Final Words:
    // Seamless continuity: Do NOT pause, stop, restart, or recreate audio.
    // 3. Leaving Celebration or Final Words back to earlier stages:
    else if (!isTargetCelebrationDomain && isCurrentCelebrationDomain) {
      celebrationAudioController.stop();
      if (['gallery', 'surprise-gift', 'birthday-message'].includes(stage)) {
        memoryAudioController.resume();
      } else if (stage === 'invitation' || stage === 'age-reveal') {
        memoryAudioController.reset();
      }
    }

    setCurrentStage(stage);
  };

  const handleStartExperience = () => {
    setMusicStarted(true);
    safeSetStage('age-reveal');
  };

  return (
    <main className="app-viewport">
      {/* Dynamic Ambient Background Canvas */}
      <AmbientBackground />

      {/* Persistent Application-Level Audio Player */}
      <AudioPlayer
        config={birthdayConfig.audio}
        memoryConfig={birthdayConfig.memoryAudio}
        autoStartRequested={musicStarted}
        hasEnteredMemoryTab={hasEnteredMemoryTab}
        currentStage={currentStage}
      />

      {/* Dynamic Stage Rendering with Cinematic Fade */}
      <div className="active-stage-view" key={currentStage}>
        {currentStage === 'invitation' && (
          <StageInvitation
            config={birthdayConfig}
            onProceed={handleStartExperience}
          />
        )}

        {currentStage === 'age-reveal' && (
          <StageAgeReveal
            config={birthdayConfig}
            onProceed={() => safeSetStage('gallery')}
          />
        )}

        {currentStage === 'gallery' && (
          <StageGallery
            config={birthdayConfig}
            onProceed={() => safeSetStage('surprise-gift')}
          />
        )}

        {currentStage === 'surprise-gift' && (
          <StageSurpriseGift
            config={birthdayConfig}
            onProceed={() => safeSetStage('birthday-message')}
          />
        )}

        {currentStage === 'birthday-message' && (
          <StageMessage
            config={birthdayConfig}
            onProceed={() => safeSetStage('celebration')}
          />
        )}

        {currentStage === 'celebration' && (
          <StageCelebration
            config={birthdayConfig}
            onProceedToFinal={() => safeSetStage('final-reveal')}
          />
        )}

        {currentStage === 'final-reveal' && (
          <StageFinalReveal
            config={birthdayConfig}
            onReplay={() => {
              celebrationAudioController.stop();
              memoryAudioController.reset();
              setHasEnteredMemoryTab(false);
              setMusicStarted(false);
              safeSetStage('invitation');
            }}
          />
        )}
      </div>

      <style>{`
        .app-viewport {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          overflow-x: hidden;
          background: var(--bg-deep);
          display: flex;
          flex-direction: column;
        }

        .active-stage-view {
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
          animation: stageFadeIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes stageFadeIn {
          from {
            opacity: 0;
            transform: scale3d(0.985, 0.985, 1) translate3d(0, 6px, 0);
          }
          to {
            opacity: 1;
            transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
          }
        }
      `}</style>
    </main>
  );
};

export default App;
