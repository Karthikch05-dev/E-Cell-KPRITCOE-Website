
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function EventDetails() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  async function fetchEvent() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      setLoading(false);
      return;
    }

    setEvent(data);
    setLoading(false);
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(time) {
    if (!time) return "Time will be announced";

    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <main className="event-details-page">
        <p>Loading event...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="event-details-page">
        <h1>Event Not Found</h1>
        <p>The event you're looking for doesn't exist.</p>

        <Link to="/events" className="primary-button">
          Back to Events →
        </Link>
      </main>
    );
  }

  return (
    <main className="event-details-page">

      <section className="event-details-hero">

        <div className="event-details-content">

          <p className="section-label">
            E-CELL EVENT
          </p>

          <h1>{event.title}</h1>

          <p className="event-details-description">
            {event.description}
          </p>

          <div className="event-details-meta">

            <div>
              <span>DATE</span>
              <strong>{formatDate(event.event_date)}</strong>
            </div>

            <div>
              <span>TIME</span>
              <strong>{formatTime(event.event_time)}</strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>{event.location || "KPRIT-COE"}</strong>
            </div>

          </div>

          <Link
            to={`/register?event=${encodeURIComponent(event.title)}`}
            className="primary-button"
          >
            Register Now
            <span>→</span>
          </Link>

        </div>

        {event.image_url && (
          <div className="event-details-image">
            <img
              src={event.image_url}
              alt={event.title}
            />
          </div>
        )}

      </section>

      <section className="event-details-bottom">

        <Link to="/events" className="secondary-button">
          ← Back to Events
        </Link>

      </section>

    </main>
  );
}

export default EventDetails;
