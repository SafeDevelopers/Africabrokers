"use client";

import { useEffect, useRef } from "react";

type DialogProps = {
  open: boolean;
  title?: string;
  onClose: () => void;
  // Accept both RefObject and MutableRefObject shapes
  initialFocusRef?: { current: HTMLElement | null };
  children: React.ReactNode;
};

export default function Dialog({ open, title, onClose, initialFocusRef, children }: DialogProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previousActive = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousActive.current = document.activeElement as HTMLElement | null;

    const container = containerRef.current;
    // focus initial element if provided, otherwise focus container
    setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      } else if (container) {
        const focusable = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length) focusable[0].focus();
        else container.focus();
      }
    }, 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    function onClickOutside(e: MouseEvent) {
      if (!container) return;
      if (!container.contains(e.target as Node)) {
        onClose();
      }
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
      previousActive.current?.focus();
    };
  }, [open, onClose, initialFocusRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" aria-hidden={!open}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        {children}
      </div>
    </div>
  );
}
