import { useOnboarding } from '../../context/OnboardingContext.tsx';
import './OnboardingLayout.css';

const STEP_LABELS = [
  'Selskap',
  'Team',
  'Bygg',
  'Roller',
  'Gjennomgang',
  'Ferdig',
];

interface OnboardingLayoutProps {
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  showSkip?: boolean;
  showFooter?: boolean;
}

export function OnboardingLayout({
  children,
  onNext,
  onBack,
  onSkip,
  nextLabel = 'Neste steg →',
  nextDisabled = false,
  showBack = true,
  showSkip = false,
  showFooter = true,
}: OnboardingLayoutProps) {
  const { step } = useOnboarding();

  return (
    <div className="onboarding">
      <div className="onboarding__header">
        <div className="onboarding__logo">EXIO</div>
        <div className="onboarding__steps">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isCompleted = stepNum < step;
            return (
              <div key={label} className="onboarding__step-item">
                {i > 0 && (
                  <div
                    className={`onboarding__step-line ${
                      stepNum <= step ? 'onboarding__step-line--active' : ''
                    }`}
                  />
                )}
                <div
                  className={`onboarding__step-circle ${
                    isActive ? 'onboarding__step-circle--active' : ''
                  } ${isCompleted ? 'onboarding__step-circle--completed' : ''}`}
                >
                  {isCompleted ? (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7L6 10L11 4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={`onboarding__step-label ${
                    isActive ? 'onboarding__step-label--active' : ''
                  } ${isCompleted ? 'onboarding__step-label--completed' : ''}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="onboarding__subtitle">Steg {step} av 6</div>
      </div>

      <div className="onboarding__content">{children}</div>

      {showFooter && (
        <div className="onboarding__footer">
          <div className="onboarding__footer-left">
            {showBack && step > 1 && (
              <button className="onboarding__btn onboarding__btn--outline" onClick={onBack}>
                Tilbake
              </button>
            )}
            {showSkip && (
              <button className="onboarding__btn-skip" onClick={onSkip}>
                Hopp over
              </button>
            )}
          </div>
          <div className="onboarding__footer-right">
            <button
              className="onboarding__btn onboarding__btn--primary"
              onClick={onNext}
              disabled={nextDisabled}
            >
              {nextLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
