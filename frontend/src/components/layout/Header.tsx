"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { useState, useEffect, useRef } from "react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/scan", label: "Scan" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, profile, logout } = useUserStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Close mobile menu on escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{
        borderColor: "var(--color-border-light)",
        backgroundColor: "rgba(250, 248, 245, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-md focus:font-semibold focus:text-sm"
        style={{
          backgroundColor: "var(--color-brand)",
          color: "white",
        }}
      >
        Skip to main content
      </a>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="MediScript AI home"
        >
          <span
            className="font-display text-xl font-bold"
            style={{ color: "var(--color-brand)" }}
          >
            ℞
          </span>
          <span className="font-display font-semibold text-base text-ink">
            MediScript
            <span style={{ color: "var(--color-brand)" }}>AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Main navigation"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className="relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                style={{
                  color: isActive
                    ? "var(--color-brand-dark)"
                    : "var(--color-ink-light)",
                  backgroundColor: isActive
                    ? "var(--color-brand-light)"
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-paper-warm)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-2 py-1 rounded-md transition-colors"
                style={{
                  backgroundColor: isProfileOpen
                    ? "var(--color-paper-warm)"
                    : "transparent",
                }}
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  style={{
                    backgroundColor: "var(--color-brand-light)",
                    color: "var(--color-brand)",
                  }}
                >
                  {profile?.name?.charAt(0).toUpperCase() ?? "U"}
                </span>
                <span
                  className="text-sm font-medium hidden lg:inline"
                  style={{ color: "var(--color-ink)" }}
                >
                  {profile?.name ?? "User"}
                </span>
              </button>

              {isProfileOpen && (
                <div
                  className="absolute right-0 mt-1 w-44 rounded-md border py-1 z-50"
                  style={{
                    backgroundColor: "var(--color-paper)",
                    borderColor: "var(--color-border)",
                  }}
                  role="menu"
                >
                  <Link
                    href="/profile"
                    className="block px-3 py-2 text-sm transition-colors"
                    style={{ color: "var(--color-ink-light)" }}
                    role="menuitem"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-paper-warm)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    Medical Profile
                  </Link>
                  <button
                    type="button"
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 text-sm transition-colors"
                    style={{ color: "var(--color-signal)" }}
                    role="menuitem"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-signal-light)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                style={{ color: "var(--color-ink-light)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-paper-warm)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-1.5 text-sm font-medium rounded-md border transition-colors"
                style={{
                  color: "white",
                  backgroundColor: "var(--color-brand)",
                  borderColor: "var(--color-brand-dark)",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden p-2 rounded-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
          aria-controls="mobile-menu"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          style={{ color: "var(--color-ink)" }}
        >
          {isMobileOpen ? (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu drawer */}
      {isMobileOpen && (
        <nav
          id="mobile-menu"
          className="md:hidden border-t px-4 py-4"
          style={{
            borderColor: "var(--color-border-light)",
            backgroundColor: "var(--color-paper)",
          }}
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className="px-3 py-2.5 text-sm font-medium rounded-md"
                  style={{
                    color: isActive
                      ? "var(--color-brand-dark)"
                      : "var(--color-ink-light)",
                    backgroundColor: isActive
                      ? "var(--color-brand-light)"
                      : "transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div
            className="h-px my-3"
            style={{ backgroundColor: "var(--color-border-light)" }}
          />

          {isAuthenticated ? (
            <div className="flex flex-col gap-1">
              <Link
                href="/profile"
                className="px-3 py-2.5 text-sm font-medium rounded-md"
                style={{ color: "var(--color-ink-light)" }}
              >
                Medical Profile
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-3 py-2.5 text-sm font-medium rounded-md text-left"
                style={{ color: "var(--color-signal)" }}
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mt-1">
              <Link
                href="/login"
                className="px-3 py-2.5 text-sm font-medium rounded-md text-center border"
                style={{
                  color: "var(--color-ink-light)",
                  borderColor: "var(--color-border)",
                }}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="px-3 py-2.5 text-sm font-medium rounded-md text-center"
                style={{
                  color: "white",
                  backgroundColor: "var(--color-brand)",
                }}
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
