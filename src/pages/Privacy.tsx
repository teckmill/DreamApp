import React from 'react';

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Privacy Policy</h1>
      
      <div className="prose dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, including account details,
            dream journal entries, and community interactions.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use your information to provide and improve our services, analyze dream patterns,
            and enhance the community experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Data Storage</h2>
          <p className="mb-4">
            Your dream journal entries and personal information are stored securely and are
            not shared with third parties without your consent.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Cookies and Analytics</h2>
          <p className="mb-4">
            We use cookies and similar technologies to improve your experience and analyze
            usage patterns.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="mb-4">
            You have the right to access, modify, or delete your personal information at any time
            through your account settings.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about our privacy practices, please contact us at
            privacy@dreamscape.app
          </p>
        </section>
      </div>
    </div>
  );
} 