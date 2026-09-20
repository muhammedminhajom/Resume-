import { Link } from 'react-router-dom';
import { FileText, ArrowLeft, Scale, CheckCircle2, AlertTriangle } from 'lucide-react';
import Footer from '../components/common/Footer';

export default function TermsOfServicePage() {
  const lastUpdated = 'September 4, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-20 border-b border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 dark:text-surface-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Application</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Terms Version 1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/60 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-4">
              <Scale size={14} strokeWidth={2.5} />
              Legal Agreement
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-surface-900 dark:text-surface-100">
              Terms of Service
            </h1>
            <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
              Last updated on <time dateTime="2026-09-04">{lastUpdated}</time>
            </p>
          </div>

          {/* Highlights Banner */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 shadow-card">
              <div className="flex items-center gap-2.5 text-brand-600 dark:text-brand-400 font-semibold text-sm">
                <CheckCircle2 size={18} />
                <h3>Your Intellectual Property</h3>
              </div>
              <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                You retain all rights, title, and ownership of any resume, text, and materials you create or upload.
              </p>
            </div>

            <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 shadow-card">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <FileText size={18} />
                <h3>Professional Document Integrity</h3>
              </div>
              <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Generated resumes, downloads, and exports remain strictly free of advertisements and watermarks.
              </p>
            </div>

            <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 shadow-card">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <AlertTriangle size={18} />
                <h3>Acceptable Use</h3>
              </div>
              <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                You agree not to misuse services for unlawful purposes, automated scraping, or uploading malicious files.
              </p>
            </div>
          </div>

          {/* Detailed Terms Sections */}
          <article className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-surface-700 dark:text-surface-300">
            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using Resume Builder (&quot;the Service&quot;), you confirm that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms, please discontinue using the Service immediately.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                2. User Accounts &amp; Security
              </h2>
              <p>
                To create and save resumes, you must register an account. You are responsible for safeguarding your login credentials and are solely responsible for any activities under your account. Notify us immediately if you suspect any unauthorized access.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                3. User Content &amp; Intellectual Property
              </h2>
              <p>
                You retain complete ownership of all resumes, work history, skill summaries, and documents created or imported into the platform. We do not claim any copyright over your career documents. We grant you a non-exclusive license to use the application&apos;s templates and styling engines to compile your documents.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                4. Third-Party Advertisements (Google AdSense)
              </h2>
              <p>
                The Service is supported in part by advertising provided by Google AdSense and third-party advertising networks. Advertisements are restricted to non-confidential application areas (e.g. dashboard, public tools) and will never appear in your exported resume documents or builder canvas.
              </p>
              <p>
                We do not endorse any products, services, or claims made in third-party advertisements displayed through Google AdSense.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                5. Disclaimers &amp; Limitation of Liability
              </h2>
              <p>
                The Service, including ATS analysis heuristics and job matching algorithms, is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. While our ATS scores are designed to match industry standards, we do not guarantee employment, interviews, or hiring outcomes.
              </p>
              <p>
                Under no circumstances shall Resume Builder, its owners, or contributors be liable for any indirect, incidental, or consequential damages resulting from your use of the platform.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                6. Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate accounts that violate our terms, engage in abusive requests, or attempt to compromise server infrastructure. You may delete your account and all associated resumes at any time.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                7. Contact Us
              </h2>
              <p>
                For legal inquiries, copyright notices, or questions regarding these Terms of Service, please contact{' '}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=supportbuilderresume@gmail.com&su=Resume%20Builder%20Legal%20Inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 dark:text-brand-400 underline hover:text-brand-700 dark:hover:text-brand-300"
                  title="Contact Support (Opens Gmail)"
                >
                  supportbuilderresume@gmail.com
                </a>.
              </p>
            </section>
          </article>
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
