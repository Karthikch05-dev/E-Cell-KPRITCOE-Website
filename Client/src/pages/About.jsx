function About() {
  const leadership = [
    ["Dr. Sreenath Kashyap", "Chief Patron"],
    ["Y V D Chandra Sekhar", "Faculty Advisor"],
  ];

  const coreTeam = [
    ["Manikanta Datta Sriteja", "President"],
    ["Hari Prasad", "Vice President"],
    ["Abhishek Kalvala", "General Secretary"],
    ["Manasvitha", "Joint Secretary"],
    ["Poojitha", "Treasurer"],
  ];

  const departments = [
    {
      title: "Innovation & Entrepreneurship",
      members: [
        ["Khushi Tiwari", "Head"],
        ["G. Varshitha", "Member"],
      ],
    },
    {
      title: "Corporate Relations & Sponsorship",
      members: [
        ["Bhavya Bhaireddy", "Head"],
        ["Ankitha", "Member"],
      ],
    },
    {
      title: "Events & Operations",
      members: [
        ["Deepika Ganti", "Head"],
        ["V. Meghana", "Member"],
      ],
    },
    {
      title: "Marketing & Branding",
      members: [
        ["S. Rasmitha", "Head"],
        ["Varshini", "Member"],
      ],
    },
    {
      title: "Public Relations & Outreach",
      members: [
        ["Chandra Shekar", "Head"],
        ["Shukla", "Member"],
      ],
    },
    {
      title: "Promotion & Media",
      members: [
        ["K. Sharon", "Head"],
        ["G. Shekar", "Member"],
      ],
    },
    {
      title: "Technical & Development",
      members: [
        ["Srikanth Parikibanda", "Head"],
        ["T. Siddartha", "Member"],
        ["Akshay", "Member"],
      ],
    },
    {
      title: "Research & Documentation",
      members: [
        ["Rajender", "Head"],
        ["Vyas", "Member"],
      ],
    },
  ];

  const initials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const PersonCard = ({ name, role, featured = false }) => (
    <div className={`about-person-card ${featured ? "featured" : ""}`}>
      <div className="about-person-avatar">
        {initials(name)}
      </div>

      <div className="about-person-details">
        <h3>{name}</h3>
        <span>{role}</span>
      </div>
    </div>
  );

  return (
    <main className="about-page">

      {/* HERO */}
      <section className="about-hero">

        <div className="about-hero-content">
          <p className="section-label">ABOUT US</p>

          <h1>
            Building the
            <span> Next Generation</span>
          </h1>

          <p>
            The Entrepreneurship Cell at KPRIT-COE is a
            student-driven platform dedicated to entrepreneurship,
            innovation and creating meaningful opportunities for
            aspiring entrepreneurs.
          </p>
        </div>

        <div className="about-hero-logo">
  <img
    src="/images/KPRIT-ECELL-Logo.jpeg"
    alt="E-Cell KPRIT-COE Logo"
  />
</div>

      </section>


      {/* LEADERSHIP */}
      <section className="about-team-section">

        <div className="about-section-heading">
          <p className="section-label">LEADERSHIP</p>
          <h2>Guiding the Vision</h2>
          <div className="heading-line"></div>
        </div>

        <div className="leadership-cards">
          {leadership.map(([name, role]) => (
            <PersonCard
              key={name}
              name={name}
              role={role}
              featured
            />
          ))}
        </div>

      </section>


      {/* CORE TEAM */}
      <section className="about-team-section">

        <div className="about-section-heading">
          <p className="section-label">CORE TEAM</p>
          <h2>The Team Behind E-Cell</h2>
          <div className="heading-line"></div>
        </div>

        <div className="core-team-grid">
          {coreTeam.map(([name, role]) => (
            <PersonCard
              key={name}
              name={name}
              role={role}
            />
          ))}
        </div>

      </section>


      {/* DEPARTMENTS */}
      <section className="about-team-section">

        <div className="about-section-heading">
          <p className="section-label">OUR TEAMS</p>
          <h2>Working Together</h2>
          <p>
            Different teams, one shared mission — to build a stronger
            culture of innovation and entrepreneurship at KPRIT-COE.
          </p>
          <div className="heading-line"></div>
        </div>

        <div className="departments-grid">

          {departments.map((department) => (
            <article
              className="department-card"
              key={department.title}
            >

              <div className="department-title">
                <span></span>
                <h3>{department.title}</h3>
              </div>

              <div className="department-people">

                {department.members.map(([name, role]) => (
                  <div className="department-person" key={name}>

                    <div className="department-avatar">
                      {initials(name)}
                    </div>

                    <div>
                      <strong>{name}</strong>
                      <small>{role}</small>
                    </div>

                  </div>
                ))}

              </div>

            </article>
          ))}

        </div>

      </section>

    </main>
  );
}

export default About;