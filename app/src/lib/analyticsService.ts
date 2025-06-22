import type { PostHog } from 'posthog-js';

// Analytics service for centralized event tracking
export class AnalyticsService {
  private posthog: PostHog | null = null;
  private isProduction = process.env.REACT_APP_VERCEL_ENV === "production";

  constructor(posthogInstance?: PostHog) {
    this.posthog = posthogInstance || null;
  }

  setPostHog(posthogInstance: PostHog) {
    this.posthog = posthogInstance;
  }

  private canTrack(): boolean {
    return !!(this.posthog && this.isProduction);
  }

  // User identification with comprehensive properties
  identifyUser(email: string, additionalProps?: Record<string, any>) {
    if (!this.canTrack() || !email) return;

    this.posthog!.identify(email, {
      email,
      $email: email,
      user_type: additionalProps?.hasProAccess ? 'pro' : 'free',
      signup_date: additionalProps?.signupDate,
      last_active: new Date().toISOString(),
      ...additionalProps
    });
  }

  // Set user properties without identifying
  setUserProperties(properties: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.setPersonProperties(properties);
  }

  // Core flowchart events
  trackFlowchartCreated(properties: {
    template: string;
    name: string;
    source: 'new_page' | 'duplicate' | 'template' | 'ai';
    user_type: 'free' | 'pro';
    is_first_chart?: boolean;
  }) {
    if (!this.canTrack()) return;
    this.posthog!.capture('flowchart_created', properties);
  }

  trackFlowchartSaved(properties: {
    chart_id: string;
    user_type: 'free' | 'pro';
    chart_size?: number; // number of nodes/text length
    time_spent?: number; // in seconds
  }) {
    if (!this.canTrack()) return;
    this.posthog!.capture('flowchart_saved', properties);
  }

  trackFlowchartShared(properties: {
    chart_id: string;
    share_method: 'link' | 'download' | 'export';
    export_format?: 'png' | 'svg' | 'pdf';
    user_type: 'free' | 'pro';
  }) {
    if (!this.canTrack()) return;
    this.posthog!.capture('flowchart_shared', properties);
  }

  trackFlowchartDeleted(properties: {
    chart_id: string;
    user_type: 'free' | 'pro';
    charts_remaining?: number;
  }) {
    if (!this.canTrack()) return;
    this.posthog!.capture('flowchart_deleted', properties);
  }

  // User engagement events
  trackPageView(page: string, additionalProps?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('$pageview', {
      page,
      ...additionalProps
    });
  }

  trackFeatureUsed(feature: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('feature_used', {
      feature,
      ...properties
    });
  }

  // Authentication events
  trackUserSignUp(method: 'email' | 'google' | 'github', properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('user_signed_up', {
      signup_method: method,
      ...properties
    });
  }

  trackUserSignIn(method: 'email' | 'google' | 'github', properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('user_signed_in', {
      signin_method: method,
      ...properties
    });
  }

  trackUserSignOut() {
    if (!this.canTrack()) return;
    this.posthog!.capture('user_signed_out');
  }

  // Conversion events
  trackPaywallShown(context: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('paywall_shown', {
      context,
      ...properties
    });
  }

  trackPaywallClicked(context: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('paywall_clicked', {
      context,
      ...properties
    });
  }

  trackSubscriptionStarted(plan: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('subscription_started', {
      plan,
      revenue: properties?.amount,
      ...properties
    });
  }

  trackSubscriptionCancelled(reason?: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('subscription_cancelled', {
      cancellation_reason: reason,
      ...properties
    });
  }

  // AI features
  trackAIFlowchartGenerated(properties: {
    prompt_length: number;
    generation_time?: number;
    success: boolean;
    template_used?: string;
  }) {
    if (!this.canTrack()) return;
    this.posthog!.capture('ai_flowchart_generated', properties);
  }

  trackAIEditUsed(properties: {
    edit_type: 'modify' | 'expand' | 'simplify';
    success: boolean;
    user_type: 'free' | 'pro';
  }) {
    if (!this.canTrack()) return;
    this.posthog!.capture('ai_edit_used', properties);
  }

  // Template usage
  trackTemplateUsed(templateName: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('template_used', {
      template_name: templateName,
      ...properties
    });
  }

  // User journey milestones
  trackMilestone(milestone: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('milestone_reached', {
      milestone,
      ...properties
    });
  }

  // Error tracking
  trackError(error: string, context?: string, properties?: Record<string, any>) {
    if (!this.canTrack()) return;
    this.posthog!.capture('error_occurred', {
      error_message: error,
      error_context: context,
      ...properties
    });
  }

  // Reset user data (for logout)
  reset() {
    if (!this.canTrack()) return;
    this.posthog!.reset();
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();