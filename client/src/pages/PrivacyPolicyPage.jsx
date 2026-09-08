import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Lock, Cookie, FileText, Globe, Eye } from 'lucide-react';
import Footer from '../components/common/Footer';

export default function PrivacyPolicyPage() {
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
            <span>Policy Version 1.0</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Header Banner */}
          <div className="mb-10 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 dark:bg-brand-950/60 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-4">
              <ShieldCheck size={14} strokeWidth={2.5} />
              Privacy &amp; Data Transparency
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-surface-900 dark:text-surface-100">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-surface-500 dark:text-surface-400">
              Last updated on <time dateTime="2026-09-04">{lastUpdated}</time>
            </p>
          </div>

          {/* Quick Summary Highlights */}
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 shadow-card">
              <div className="flex items-center gap-2.5 text-brand-600 dark:text-brand-400 font-semibold text-sm">
                <FileText size={18} />
                <h3>Your Resume Ownership</h3>
              </div>
              <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Your resume content belongs solely to you. We never sell your personal contact info, career records, or resumes.
              </p>
            </div>

            <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 shadow-card">
              <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                <Lock size={18} />
                <h3>Data Security</h3>
              </div>
              <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Passwords are cryptographically hashed using bcrypt, and user sessions are preserved through secure httpOnly cookies.
              </p>
            </div>

            <div className="rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-4 shadow-card">
              <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-400 font-semibold text-sm">
                <Cookie size={18} />
                <h3>Third-Party Ads</h3>
              </div>
              <p className="mt-2 text-xs text-surface-600 dark:text-surface-400 leading-relaxed">
                Google AdSense serves advertising on public dashboard and checker pages using standardized cookie technology.
              </p>
            </div>
          </div>

          {/* Detailed Policy Sections */}
          <article className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm leading-relaxed text-surface-700 dark:text-surface-300">
            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                1. Information We Collect
              </h2>
              <p>
                When you use Resume Builder, we collect information necessary to provide our resume drafting, ATS scoring, and job-tailoring services:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-surface-600 dark:text-surface-400">
                <li>
                  <strong>Account Details:</strong> When you register, we collect your name, email address, and encrypted credentials.
                </li>
                <li>
                  <strong>Resume &amp; Career Content:</strong> Contact information, employment history, education, skills, and summary text that you enter or upload for resume creation and analysis.
                </li>
                <li>
                  <strong>Log Data &amp; Device Information:</strong> Standard server logs including your IP address, browser type, operating system, and pages visited, utilized for rate limiting and server diagnostics.
                </li>
                <li>
                  <strong>Local Storage Preferences:</strong> User interface preferences such as dark/light theme choices and cookie consent status.
                </li>
              </ul>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                2. How We Use Your Information
              </h2>
              <p>We utilize the collected information strictly for:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-surface-600 dark:text-surface-400">
                <li>Creating, editing, storing, and exporting your formatted resumes into PDF and DOCX files.</li>
                <li>Running applicant tracking system (ATS) keyword matching and readability heuristics.</li>
                <li>Authenticating user accounts and protecting against unauthorized access or brute-force attacks.</li>
                <li>Displaying non-intrusive advertisements on designated informational pages.</li>
              </ul>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                3. Google AdSense &amp; Third-Party Advertising
              </h2>
              <p>
                We use Google AdSense to serve advertisements on certain pages of our website. Google, as a third-party vendor, uses cookies to serve ads on our site:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-surface-600 dark:text-surface-400">
                <li>
                  <strong>DoubleClick DART Cookie:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visits to our site and/or other sites on the Internet.
                </li>
                <li>
                  <strong>Opting Out:</strong> Users may opt out of personalized advertising by visiting{' '}
                  <a
                    href="https://adssettings.google.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 dark:text-brand-400 underline"
                  >
                    Google Ads Settings
                  </a>
                  . Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting{' '}
                  <a
                    href="https://www.aboutads.info/choices/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-600 dark:text-brand-400 underline"
                  >
                    aboutads.info
                  </a>
                  .
                </li>
                <li>
                  <strong>Ad-Free Documents:</strong> We strictly guarantee that no advertisements are ever placed inside your resume builder, resume preview canvases, or generated PDF/DOCX downloads.
                </li>
              </ul>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                4. Cookies and Web Beacons
              </h2>
              <p>
                Cookies are small files placed on your device. We use essential cookies to maintain secure authenticated sessions. Third-party partners (such as Google) may use cookies, JavaScript, or Web Beacons to measure advertising effectiveness and personalize ad content.
              </p>
              <p>
                You can choose to disable cookies through your individual browser options. However, disabling essential cookies may impact certain interactive functionalities like session persistence.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                5. User Privacy Rights (GDPR &amp; CCPA)
              </h2>
              <p>
                Depending on your jurisdiction, you are entitled to specific rights regarding your personal data:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-surface-600 dark:text-surface-400">
                <li><strong>Right of Access:</strong> You can inspect all resumes and personal records stored under your account at any time.</li>
                <li><strong>Right to Rectification:</strong> You can modify or correct any personal or career information directly via the application.</li>
                <li><strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You can permanently delete any or all resumes from our servers instantly.</li>
                <li><strong>Right to Data Portability:</strong> You can export your data in standardized formats (PDF, DOCX, JSON).</li>
              </ul>
            </section>

            <section className="space-y-3 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 sm:p-8 shadow-card">
              <h2 className="text-lg font-bold text-surface-900 dark:text-surface-100 flex items-center gap-2">
                6. Contact Information
              </h2>
              <p>
                If you have questions, feedback, or data privacy inquiries regarding this Privacy Policy, please contact our privacy compliance team at{' '}
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=supportbuilderresume@gmail.com&su=Resume%20Builder%20Privacy%20Inquiry"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-600 dark:text-brand-400 underline hover:text-brand-700 dark:hover:text-brand-300"
                  title="Contact Privacy Compliance (Opens Gmail)"
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
