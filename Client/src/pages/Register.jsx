import React, { useState } from "react";
import { supabase } from "../lib/supabase";

const EUREKA_URL = "https://www.ecell.in/eureka/register";
const NEC_ID = "NEC2610645";

export default function Registration() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    department: "",
    event: "",
    team_size: "",
    eureka_id: "",
    idea_description: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const normalizedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    if (!normalizedFormData.eureka_id) {
      setError("Please enter your Eureka ID before submitting.");
      return;
    }

    if (!normalizedFormData.idea_description) {
      setError("Please describe your idea before submitting.");
      return;
    }

    setSubmitting(true);
    setSuccess(false);
    setError("");

    try {
      const {
        full_name,
        email,
        phone,
        college,
        year,
        department,
        event,
        team_size,
        eureka_id,
        idea_description,
      } = normalizedFormData;

      const { error: insertError } = await supabase
        .from("registrations")
        .insert([
          {
            full_name,
            email,
            phone,
            college,
            year,
            department,
            event,
            team_size,
            idea: idea_description,
            eureka_id,
            idea_description,
          },
        ]);

      if (insertError) {
        console.error("=================================");
        console.error("REGISTRATION INSERT ERROR");
        console.error("Message:", insertError.message);
        console.error("Details:", insertError.details);
        console.error("Hint:", insertError.hint);
        console.error("Code:", insertError.code);
        console.error("Full error:", insertError);
        console.error("=================================");

        setError(
          insertError.message ||
            "Registration failed. Please try again."
        );

        return;
      }

      console.log("Registration successful.");

      setSuccess(true);

      setFormData({
        full_name: "",
        email: "",
        phone: "",
        college: "",
        year: "",
        department: "",
        event: "",
        team_size: "",
        eureka_id: "",
        idea_description: "",
      });
    } catch (err) {
      console.error("Unexpected registration error:", err);

      setError(
        err?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="registration-page">

      {/* =================================
          REGISTRATION HEADER
      ================================= */}

      <div className="registration-header">
        <p className="section-label">
          E-CELL KPRIT-COE
        </p>

        <h1>Registration</h1>

        <p>
          Register for the upcoming E-Cell KPRIT-COE
          events and be part of the experience.
        </p>
      </div>


      {/* =================================
          FORM CONTAINER
      ================================= */}

      <div className="registration-container">

        {/* =================================
            EUREKA REGISTRATION NOTICE
        ================================= */}

        <div className="eureka-registration-notice">

          <h3>
            Important — EUREKA Registration Required
          </h3>

          <p>
            Before registering for this event, you must
            first register for Eureka and obtain your
            Eureka ID.
          </p>

          <p>
            While registering on the EUREKA website,
            use our NEC ID:
          </p>

          <p className="eureka-nec-id">
            NEC ID:
            <strong>{NEC_ID}</strong>
          </p>

          <p>
            After completing the EUREKA registration,
            come back to this page and continue with
            the E-Cell KPRIT-COE registration.
          </p>

          <a
            href={EUREKA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="eureka-registration-button"
          >
            Register for Eureka
          </a>

        </div>


        {/* =================================
            SUCCESS MESSAGE
        ================================= */}

        {success && (
          <div className="success-notification">

            <div className="success-icon">
              ✓
            </div>

            <div>
              <strong>
                Registration Successful
              </strong>

              <p>
                Your registration has been submitted
                successfully.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccess(false)}
              aria-label="Close notification"
            >
              ×
            </button>

          </div>
        )}


        {/* =================================
            ERROR MESSAGE
        ================================= */}

        {error && (
          <div className="error-notification">

            <div className="error-icon">
              !
            </div>

            <div>
              <strong>
                Registration Failed
              </strong>

              <p>
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Close error notification"
            >
              ×
            </button>

          </div>
        )}


        {/* =================================
            REGISTRATION FORM
        ================================= */}

        <form
          className="registration-form"
          onSubmit={handleSubmit}
        >

          {/* FULL NAME + EMAIL */}

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="full_name">
                Full Name
              </label>

              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>


            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

          </div>


          {/* PHONE + COLLEGE */}

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
              />
            </div>


            <div className="form-group">
              <label htmlFor="college">
                College
              </label>

              <input
                id="college"
                name="college"
                type="text"
                value={formData.college}
                onChange={handleChange}
                placeholder="Enter your college"
                required
              />
            </div>

          </div>


          {/* YEAR + DEPARTMENT */}

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="year">
                Year
              </label>

              <select
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select your year
                </option>

                <option value="1st Year">
                  1st Year
                </option>

                <option value="2nd Year">
                  2nd Year
                </option>

                <option value="3rd Year">
                  3rd Year
                </option>

                <option value="4th Year">
                  4th Year
                </option>
              </select>
            </div>


            <div className="form-group">
              <label htmlFor="department">
                Department
              </label>

              <input
                id="department"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter your department"
                required
              />
            </div>

          </div>


          {/* EVENT + TEAM SIZE */}

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="event">
                Event
              </label>

              <select
                id="event"
                name="event"
                value={formData.event}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select an event
                </option>

                <option value="EUREKA!">
                  EUREKA!
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>


            <div className="form-group">
              <label htmlFor="team_size">
                Team Size
              </label>

              <input
                id="team_size"
                name="team_size"
                type="number"
                min="1"
                value={formData.team_size}
                onChange={handleChange}
                placeholder="Enter team size"
                required
              />
            </div>

          </div>


          {/* EUREKA ID */}

          <div className="form-group">
            <label htmlFor="eureka_id">
              Eureka ID
            </label>

            <input
              id="eureka_id"
              name="eureka_id"
              type="text"
              value={formData.eureka_id}
              onChange={handleChange}
              placeholder="Enter your Eureka ID"
              required
            />
          </div>


          {/* IDEA DESCRIPTION */}

          <div className="form-group">

            <label htmlFor="idea_description">
              Describe Your Idea
            </label>

            <textarea
              id="idea_description"
              name="idea_description"
              value={formData.idea_description}
              onChange={handleChange}
              placeholder="Briefly describe your idea..."
              rows="6"
              required
            />

          </div>


          {/* SUBMIT */}

          <div className="registration-submit">

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Registration"}

              {!submitting && (
                <span aria-hidden="true">
                  →
                </span>
              )}
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}
