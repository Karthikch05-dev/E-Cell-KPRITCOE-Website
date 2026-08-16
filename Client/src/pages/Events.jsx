import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    setEvents(data || []);
  }

  function formatDate(date) {
    const eventDate = new Date(date);

    return {
      month: eventDate
        .toLocaleString("en-US", { month: "short" })
        .toUpperCase(),

      day: eventDate.getDate(),

      year: eventDate.getFullYear(),
    };
  }

  return (
    <main className="events-page">

      <section className="events-header">
        <p className="section-label">E-CELL EVENTS</p>

        <h1>Explore. Participate. Build.</h1>

        <p>
          Discover upcoming workshops, competitions and
          entrepreneurship opportunities.
        </p>
      </section>

      <section className="events-list">

        {events.map((event) => {
          const date = formatDate(event.event_date);

          return (
            <div
              className="full-event-card"
              key={event.id}
              onClick={() => navigate(`/events/${event.id}`)}
              style={{ cursor: "pointer" }}
            >

              <div className="full-date">
                <span>{date.month}</span>
                <strong>{date.day}</strong>
                <small>{date.year}</small>
              </div>

              <div className="full-event-content">

                <h2>{event.title}</h2>

                <p>{event.description}</p>

                {event.event_time && (
                  <p>🕒 {event.event_time}</p>
                )}

                {event.location && (
                  <p>📍 {event.location}</p>
                )}

                <Link
                  to="/register"
                  className="primary-button"
                  onClick={(e) => e.stopPropagation()}
                >
                  Register Now →
                </Link>

              </div>

            </div>
          );
        })}

      </section>

    </main>
  );
}

export default Events;
