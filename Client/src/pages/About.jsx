function About() {
  const leadership = [
    ["Dr. Sreenath Kashyap", "Chief Patron"],
    ["Mr. Y V D Chandra Sekhar", "Faculty Advisor"],
  ];

  const coreTeam = [
    ["Mr. Manikanta Datta Sriteja", "President"],
    ["Mr. Hari Prasad", "Vice President"],
    ["Mr. Abhishek Kalvala", "General Secretary"],
    ["Ms. Manasvitha", "Joint Secretary"],
    ["Ms. Poojitha", "Treasurer"],
  ];

  const departments = [
    {
      title: "Innovation & Entrepreneurship",
      members: [
        ["Ms. Khushi Tiwari", "Head"],
        ["Ms. G. Varshitha", "Member"],
      ],
    },
    {
      title: "Corporate Relations & Sponsorship",
      members: [
        ["Ms. Bhavya Bhaireddy", "Head"],
        ["Ms. Ankitha", "Member"],
      ],
    },
    {
      title: "Events & Operations",
      members: [
        ["Ms. Deepika Ganti", "Head"],
        ["Ms. V. Meghana", "Member"],
      ],
    },
    {
      title: "Marketing & Branding",
      members: [
        ["Ms. S. Rasmitha", "Head"],
        ["Ms. Varshini", "Member"],
      ],
    },
    {
      title: "Public Relations & Outreach",
      members: [
        ["Mr. Chandra Shekar", "Head"],
        ["Ms. Shukla", "Member"],
      ],
    },
    {
      title: "Promotion & Media",
      members: [
        ["Ms. K. Sharon", "Head"],
        ["Mr. G. Shekar", "Member"],
      ],
    },
    {
      title: "Technical & Development",
      members: [
        ["Mr. Srikanth Parikibanda", "Head"],
        ["Mr. T. Siddartha", "Member"],
        ["Mr. Akshay", "Member"],
      ],
    },
    {
      title: "Research & Documentation",
      members: [
        ["Mr. Rajender", "Head"],
        ["Mr. Vyas", "Member"],
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
   src="/images/ecell-logo.png"
   alt="E-Cell KPRIT-COE"
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