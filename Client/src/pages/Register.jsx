import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function Register() {
  const [events, setEvents] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState(
    "Your registration has been submitted."
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_date")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data || []);
  }

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    college: "",
    year: "",
    department: "",
    event: "",
    teamSize: "1",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when user starts typing
    if (error) setError("");
  }

  function validateForm() {
    // Validate full name
    if (!formData.fullName.trim()) {
      setError("Full name is required");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate phone number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ""))) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate college
    if (!formData.college.trim()) {
      setError("College/Institution is required");
      return false;
    }

    // Validate year
    if (!formData.year) {
      setError("Year of study is required");
      return false;
    }

    // Validate department
    if (!formData.department.trim()) {
      setError("Department is required");
      return false;
    }

    // Validate event
    if (!formData.event) {
      setError("Please select an event");
      return false;
    }

    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Save registration
      const { error } = await supabase
        .from("registrations")
        .insert([
          {
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            college: formData.college,
            year: formData.year,
            department: formData.department,
            event: formData.event,
            team_size: Number(formData.teamSize),
          },
        ]);

      if (error) {
        console.error(
          "Registration error:",
          error.message,
          error.details,
          error.hint
        );

        setError("Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Step 2: Send confirmation email with timeout
      let emailNotice =
        "Your registration has been submitted.";

      try {
        // Create a timeout promise
        const emailPromise = supabase.functions.invoke(
          "send-registration-email",
          {
            body: {
              name: formData.fullName,
              email: formData.email,
              event: formData.event,
              teamSize: Number(formData.teamSize),
              college: formData.college,
            },
          }
        );

        // Set 10 second timeout
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Email sending timeout")),
            10000
          )
        );

        const { data: emailData, error: emailError } =
          await Promise.race([emailPromise, timeoutPromise]);

        if (emailError) {
          console.error(
            "Email function error:",
            emailError
          );

          emailNotice =
            "Your registration has been submitted, but the confirmation email could not be sent.";
        } else {
          console.log(
            "Confirmation email sent:",
            emailData
          );

          emailNotice =
            "Your registration has been submitted. A confirmation email has been sent.";
        }
      } catch (emailError) {
        console.error(
          "Email request failed:",
          emailError.message || emailError
        );

        emailNotice =
          "Your registration has been submitted, but the confirmation email could not be sent.";
      }

      // Step 3: Show success notification
      setSuccessMessage(emailNotice);
      setShowSuccess(true);

      // Step 4: Clear form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        college: "",
        year: "",
        department: "",
        event: "",
        teamSize: "1",
      });

      // Step 5: Hide notification
      setTimeout(() => {
        setShowSuccess(false);
      }, 4000);
    } finally {
      // Always clear loading state
      setIsLoading(false);
    }
  }

  return (
    <>
      {showSuccess && (
        <div className="success-notification">
          <div className="success-icon">✓</div>

          <div>
            <strong>Registration Successful!</strong>
            <p>{successMessage}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowSuccess(false)}
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="error-notification">
          <div className="error-icon">⚠</div>
          <div>
            <strong>Registration Error</strong>
            <p>{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      <main className="registration-page">

        <section className="registration-header">
          <p className="section-label">
            EVENT REGISTRATION
          </p>

          <h1>Join the Experience.</h1>

          <p>
            Register for an E-Cell KPRIT-COE event and take
            your next step towards innovation and entrepreneurship.
          </p>
        </section>

        <section className="registration-container">

          <form
            className="registration-form"
            onSubmit={handleSubmit}
          >

            {/* Full Name + Email */}

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="fullName">
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* Phone + College */}

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="phone">
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="college">
                  College / Institution
                </label>

                <input
                  id="college"
                  type="text"
                  name="college"
                  placeholder="Enter your college"
                  value={formData.college}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* Year + Department */}

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="year">
                  Year of Study
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
                  type="text"
                  name="department"
                  placeholder="e.g. CSE"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            {/* Event */}

            <div className="form-group">

              <label htmlFor="event">
                Select Event
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

                {events.map((event) => (
                  <option
                    key={event.id}
                    value={event.title}
                  >
                    {event.title}
                  </option>
                ))}
              </select>

            </div>

            {/* Team Size */}

            <div className="form-group">

              <label htmlFor="teamSize">
                Team Size
              </label>

              <select
                id="teamSize"
                name="teamSize"
                value={formData.teamSize}
                onChange={handleChange}
                required
              >
                <option value="1">
                  1 Member
                </option>

                <option value="2">
                  2 Members
                </option>

                <option value="3">
                  3 Members
                </option>

                <option value="4">
                  4 Members
                </option>
              </select>

            </div>

            {/* Submit */}

            <div className="registration-submit">

              <button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Registration"}
                {!isLoading && <span>→</span>}
              </button>

            </div>

          </form>

        </section>

      </main>
    </>
  );
}

export default Register;