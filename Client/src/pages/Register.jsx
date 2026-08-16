import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Register() {
  const [events, setEvents] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

    // Automatically select event from URL
    const params = new URLSearchParams(window.location.search);
    const eventFromURL = params.get("event");

    if (eventFromURL) {
      setFormData((prev) => ({
        ...prev,
        event: eventFromURL,
      }));
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Disable accidental double submission
    const submitButton = e.currentTarget.querySelector(
      'button[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerText = "Submitting...";
    }

    try {
      // ==========================================
      // 1. SAVE REGISTRATION TO SUPABASE
      // ==========================================

      const { data: insertedData, error: registrationError } = await supabase
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
        ])
        .select();

      if (registrationError) {
        console.error(
          "Registration error:",
          registrationError
        );

        alert(
          "Registration failed. Please try again."
        );

        return;
      }

      const registration = insertedData?.[0];
      if (!registration || !registration.id) {
        console.error("No registration ID returned");
        alert(
          "Registration failed. Please try again."
        );
        return;
      }

      console.log("Registration saved successfully with ID:", registration.id);

      // ==========================================
      // 2. FORWARD TO GOOGLE APPS SCRIPT VIA EDGE FUNCTION
      // ==========================================

      let emailSent = false;

      try {
        console.log(
          "Calling send-registration-email function..."
        );

        const { data: emailData, error: emailError } =
          await supabase.functions.invoke(
            "send-registration-email",
            {
              body: {
                registrationId: registration.id,
                name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                college: formData.college,
                year: formData.year,
                department: formData.department,
                event: formData.event,
                teamSize: Number(formData.teamSize),
                createdAt: registration.created_at,
              },
            }
          );

        console.log(
          "Email function response:",
          emailData
        );

        if (emailError) {
          console.error(
            "Email function error:",
            emailError
          );

          throw emailError;
        }

        emailSent = emailData?.success === true;
      } catch (emailError) {
        console.error(
          "Confirmation email failed:",
          emailError
        );
      }

      // ==========================================
      // 3. SHOW RESULT
      // ==========================================

      if (emailSent) {
        setSuccessMessage(
          "Registration submitted successfully. A confirmation email has been sent to your email address."
        );
      } else {
        setSuccessMessage(
          "Registration submitted successfully, but the confirmation email could not be sent right now."
        );
      }

      setShowSuccess(true);

      // ==========================================
      // 4. RESET FORM
      // ==========================================

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

      // Hide notification
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML =
          'Submit Registration <span>→</span>';
      }
    }
  }

  return (
    <>
      {showSuccess && (
        <div className="success-notification">
          <div className="success-icon">✓</div>

          <div>
            <strong>
              Registration Successful!
            </strong>

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

      <main className="registration-page">

        {/* HEADER */}
        <section className="registration-header">

          <p className="section-label">
            EVENT REGISTRATION
          </p>

          <h1>
            Join the Experience.
          </h1>

          <p>
            Register for an E-Cell KPRIT-COE event and take
            your next step towards innovation and entrepreneurship.
          </p>

        </section>

        {/* FORM */}
        <section className="registration-container">

          <form
            className="registration-form"
            onSubmit={handleSubmit}
          >

            {/* NAME + EMAIL */}
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

            {/* PHONE + COLLEGE */}
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

            {/* YEAR + DEPARTMENT */}
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

            {/* EVENT */}
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

            {/* TEAM SIZE */}
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

            {/* SUBMIT */}
            <div className="registration-submit">

              <button type="submit">
                Submit Registration
                <span>→</span>
              </button>

            </div>

          </form>

        </section>

      </main>
    </>
  );
}

export default Register;