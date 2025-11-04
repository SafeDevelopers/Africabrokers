"use client";

import { useEffect } from "react";

export function ScrollToContact() {
  useEffect(() => {
    // Check if we have the contact-form hash in the URL
    if (typeof window !== "undefined" && window.location.hash === "#contact-form") {
      const element = document.getElementById("contact-form");
      if (element) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Focus the first input in the form after scrolling
          setTimeout(() => {
            const firstInput = element.querySelector("input") as HTMLInputElement;
            if (firstInput) {
              firstInput.focus();
            }
          }, 600);
        }, 200);
      }
    }
  }, []);

  return null;
}

