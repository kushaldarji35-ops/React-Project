import React, { useState } from "react";
import { TfiEmail } from "react-icons/tfi";
import "./NewsletterBanner.css";

export default function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter__inner">
        <h2 className="newsletter__heading">
          STAY UPTO DATE ABOUT OUR LATEST OFFERS
        </h2>
        <div className="newsletter__form-wrap">
          {subscribed ? (
            <p className="newsletter__success">
               You're subscribed! Thanks for signing up.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="newsletter__input-wrap">
                <TfiEmail size={17} className="newsletter__input-icon" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter__input"
                />
              </div>
              <button type="submit" className="newsletter__btn">
                Subscribe to Newsletter
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
