export const financialOnboardingStorageKey = 'dorah:financial-controller:onboarding';

export type RecordKeeping = 'paper' | 'digital' | 'unorganized';
export type SetupChoice = 'balances' | 'import' | 'fresh' | 'skipped';

export type FinancialOnboardingProfile = {
  businessName: string;
  businessType: string;
  industry: string;
  country: string;
  currency: string;
  recordKeeping: RecordKeeping;
  setupChoice: SetupChoice;
};

export function saveFinancialOnboardingProfile(profile: FinancialOnboardingProfile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(financialOnboardingStorageKey, JSON.stringify(profile));
}

export function getFinancialOnboardingProfile(): FinancialOnboardingProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(financialOnboardingStorageKey);
    return stored ? JSON.parse(stored) as FinancialOnboardingProfile : null;
  } catch {
    return null;
  }
}
