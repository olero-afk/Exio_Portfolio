import { useEffect } from 'react';
import { useOnboarding } from '../context/OnboardingContext.tsx';
import { StepSelskap } from '../components/onboarding/steps/StepSelskap.tsx';
import { StepTeam } from '../components/onboarding/steps/StepTeam.tsx';
import { StepBygg } from '../components/onboarding/steps/StepBygg.tsx';
import { StepRoller } from '../components/onboarding/steps/StepRoller.tsx';
import { StepGjennomgang } from '../components/onboarding/steps/StepGjennomgang.tsx';
import { StepFerdig } from '../components/onboarding/steps/StepFerdig.tsx';

export function OnboardingPage() {
  const { step, resetOnboarding } = useOnboarding();

  // Reset wizard state on mount so each visit starts fresh
  useEffect(() => {
    resetOnboarding();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  switch (step) {
    case 1: return <StepSelskap />;
    case 2: return <StepTeam />;
    case 3: return <StepBygg />;
    case 4: return <StepRoller />;
    case 5: return <StepGjennomgang />;
    case 6: return <StepFerdig />;
    default: return <StepSelskap />;
  }
}
