"use client";

import { useState } from "react";

export default function PrivacyPolicyBanner() {
  const [consent, setContent] = useState(
    localStorage.getItem("cookie-consent"),
  );

  if (consent) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-6">
      <div className="pointer-events-auto max-w-xl rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-900/10">
        <p className="text-sm leading-6 text-gray-900">
          Lorcanito is NOT affiliated with, authorized or endorsed by, or in any
          way officially connected with, The Walt Disney Company, Disney
          Enterprises, Inc., or any of their affiliates. All Disney artwork,
          copyrights, trademarks, service marks, and trade names are proprietary
          to Disney Enterprises, Inc. or, its subsidiary, affiliated and related
          companies. See our{" "}
          <a href="/privacy" className="font-semibold text-indigo-600">
            privacy policy
          </a>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <button
            data-testid="privacy-policy-banner-accept"
            type="button"
            onClick={() => {
              localStorage.setItem("cookie-consent", "true");
              setContent("true");
            }}
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
          >
            I understand
          </button>
          <button
            type="button"
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            I do not understand
          </button>
        </div>
      </div>
    </div>
  );
}
