import { useState } from 'react';
import { useOnboarding } from '../../../context/OnboardingContext.tsx';
import { OnboardingLayout } from '../OnboardingLayout.tsx';
import './Steps.css';

export function StepTeam() {
  const { teamMembers, addTeamMember, removeTeamMember, setStep } = useOnboarding();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'bruker'>('bruker');

  function handleAdd() {
    if (!email.trim() || !email.includes('@')) return;
    if (teamMembers.some((m) => m.email === email.trim())) return;
    addTeamMember({ email: email.trim(), role, status: 'invited' });
    setEmail('');
    setRole('bruker');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleAdd();
  }

  return (
    <OnboardingLayout
      onNext={() => setStep(3)}
      onBack={() => setStep(1)}
      onSkip={() => setStep(3)}
      showSkip
    >
      <h2 className="onb-heading">Legg til teammedlemmer</h2>
      <p className="onb-subheading">
        Inviter kollegaer til å bruke Exio Portfolio. Du kan også gjøre dette senere.
      </p>

      <div className="step-team__add-section">
        <div className="step-team__add-row">
          <input
            className="onb-input step-team__email-input"
            type="email"
            placeholder="E-postadresse"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className="onb-select"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'bruker')}
          >
            <option value="admin">Admin</option>
            <option value="bruker">Bruker</option>
          </select>
          <button
            className="onboarding__btn onboarding__btn--primary"
            onClick={handleAdd}
            disabled={!email.trim() || !email.includes('@')}
          >
            Legg til
          </button>
        </div>
      </div>

      {teamMembers.length === 0 ? (
        <div className="step-team__empty">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#5a5a5a" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <p>Du kan legge til teammedlemmer nå eller senere.</p>
        </div>
      ) : (
        <div className="step-team__list">
          {teamMembers.map((member) => (
            <div key={member.email} className="step-team__member onb-card">
              <div className="step-team__member-info">
                <div className="step-team__member-avatar">
                  {member.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="step-team__member-email">{member.email}</div>
                  <div className="step-team__member-role">
                    {member.role === 'admin' ? 'Administrator' : 'Bruker (kun visning)'}
                  </div>
                </div>
              </div>
              <button
                className="step-team__remove-btn"
                onClick={() => removeTeamMember(member.email)}
                title="Fjern"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </OnboardingLayout>
  );
}
