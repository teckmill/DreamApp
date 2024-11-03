import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Terms of Service</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using DreamScape, you agree to be bound by these Terms of Service.
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. User Accounts</h2>
          <p className="mb-4">
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Content Guidelines</h2>
          <p className="mb-4">
            Users are responsible for the content they post. Content must not violate any
            applicable laws or contain inappropriate material.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Premium Features</h2>
          <p className="mb-4">
            Premium features are available through our ad-based reward system. Access to these
            features is subject to our fair use policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Privacy</h2>
          <p className="mb-4">
            Your privacy is important to us. Please review our Privacy Policy to understand
            how we collect and use your information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Modifications</h2>
          <p className="mb-4">
            We reserve the right to modify these terms at any time. Continued use of the
            service constitutes acceptance of any modifications.
          </p>
        </section>
      </div>
    </div>
  );
} 