import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const AppHeader = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hiddenPaths = ['/', '/register'];

  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md shadow-md dark:border-[var(--border)] dark:bg-[var(--surface-soft)]/95 animate-fade-up">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-[var(--text)] group"
        >
          <div className="rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 p-1.5 shadow-lg group-hover:shadow-sky-500/50 transition-all duration-300">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <span className="hidden text-lg font-bold sm:inline bg-gradient-to-r from-[var(--accent)] to-sky-500 bg-clip-text text-transparent">
            SmartStudy
          </span>
        </Link>
        {isAuthenticated && (
          <>
            {/* Desktop Nav */}
            <nav className="hidden md:flex flex-wrap items-center gap-2">
              <Link
                to="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--muted)] transition duration-300 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)] dark:hover:shadow-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--muted)] transition duration-300 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
              >
                Tasks
              </Link>
              <Link
                to="/calendar"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[var(--muted)] transition duration-300 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
              >
                Calendar
              </Link>
              <Link
                to="/profile"
                className="rounded-lg p-2.5 text-[var(--muted)] transition duration-300 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
                aria-label="Profile"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5zm0 2c-3.866 0-7 3.134-7 7v1h14v-1c0-3.866-3.134-7-7-7z" />
                </svg>
              </Link>
              <button
                onClick={toggleTheme}
                className="rounded-lg p-2.5 text-[var(--muted)] transition duration-300 hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)] dark:hover:shadow-lg"
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              >
                {theme === 'dark' ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden rounded-lg p-2 hover:bg-[var(--surface-soft)] dark:hover:bg-[var(--surface-strong)] transition"
              aria-label="Toggle menu"
            >
              <svg
                className={`h-6 w-6 transition transform ${mobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] dark:border-[var(--border)] dark:bg-[var(--surface-soft)]">
          <nav className="flex flex-col gap-2 px-4 py-4">
            <div className="px-1">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg w-full px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
              >
                Dashboard
              </Link>
            </div>
            <div className="px-1">
              <Link
                to="/tasks"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg w-full px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
              >
                My Tasks
              </Link>
            </div>
            <div className="px-1">
              <Link
                to="/calendar"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg w-full px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
              >
                Calendar
              </Link>
            </div>
            <div className="px-1">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg w-full px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
              >
                Profile
              </Link>
            </div>
            <div className="px-1">
              <button
                onClick={() => {
                  toggleTheme();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-3 rounded-lg w-full px-4 py-3 text-sm font-semibold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--text)] dark:text-[var(--muted)] dark:hover:bg-[var(--surface-strong)] dark:hover:text-[var(--accent)]"
              >
                {theme === 'dark' ? (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
                    </svg>
                    Light Mode
                  </>
                ) : (
                  <>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Dark Mode
                  </>
                )}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default AppHeader;
