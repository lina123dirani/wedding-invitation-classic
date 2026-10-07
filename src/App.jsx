import { useEffect, useRef, useState } from "react";
import "./App.css";

const images = {
  couple: "/images/couple.png",
  bouquet: "/images/bouquet.png",
  envelope: "/images/envelope.png",
  envelopeBack: "/images/envelope-back.png",
  rose: "/images/rose.png",
  envelopeOpen: "/images/envelope-open.png",
  envelopeSmall: "/images/envelope-small.png",
  record: "/images/record.png",
  doily: "/images/doily.png",
  heart: "/images/heart.png",
  cake: "/images/cake.png",
  dance: "/images/dance.png",
  rings: "/images/rings.png",
  photo: "/images/photo.png",
  dinner: "/images/dinner.png",
  car: "/images/car.png",
  canopy: "/images/canopy.png",
  flower: "/images/flower.jpg",
  plaque: "/images/plaque.png",
  wax: "/images/wax.png",
  pageTwo: "/images/page-two.png",
  shotA: "/images/polaroid-1.png",
  shotB: "/images/polaroid-2.png",
  shotC: "/images/polaroid-3.png",
  countdownBg: "/images/countdown-bg.jpg",
  paper: "/images/paper-banner.jpg",
  pin: "/images/pin.png",
  hallArt: "/images/hall.png",
  heartSpark: "/images/heart-spark.png",
  maker: "/images/thread-vow.png",
};

const wedding = {
  dateLabel: "16 September 2027",
  startsAt: "2027-09-16T20:00:00+03:00",
  replyBy: "September 10, 2027",
  hall: "Luxury Palace",
  place: "Four Seasons Hotel, Damascus",
  map: "https://www.google.com/maps/search/?api=1&query=Four+Seasons+Hotel+Damascus",
};

const timelineLeft = [
  { time: "8:00 pm", label: "Wedding Ceremony", art: images.rings },
  { time: "10:00 pm", label: "Photography", art: images.photo },
  { time: "11:00 pm", label: "Cake Cutting", art: images.cake },
];

const timelineRight = [
  { time: "8:30 pm", label: "Dance", art: images.dance },
  { time: "10:00 pm", label: "Dinner", art: images.dinner },
  { time: "12:00 pm", label: "The End of Party", art: images.car },
];

function AnimatedText({ text, className = "", delay = 0, as: Tag = "p" }) {
  const lines = text.split("\n");
  let index = 0;

  return (
    <Tag className={`animated ${className}`}>
      {lines.map((line, lineIndex) => (
        <span className="line" key={lineIndex}>
          {line
            .split(/\s+/)
            .filter(Boolean)
            .map((word) => {
              const wordIndex = index++;
              return (
                <span
                  className="word"
                  key={`${lineIndex}-${wordIndex}`}
                  style={{ animationDelay: `${delay + wordIndex * 0.14}s` }}
                >
                  {word}
                </span>
              );
            })}
        </span>
      ))}
    </Tag>
  );
}

function Reveal({ children, className = "", style }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShown(true);
      },
      { threshold: 0.28 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${shown ? "is-shown" : ""}`} style={style}>
      {children}
    </div>
  );
}

function useCountdown(iso) {
  const target = new Date(iso).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const diff = target - now;
  const past = diff <= 0;
  if (past) {
    return { past, months: 0, weeks: 0, days: 0, hours: 0 };
  }

  const start = new Date(now);
  const end = new Date(target);
  let months = 0;
  while (months < 36) {
    const next = new Date(start);
    next.setMonth(next.getMonth() + months + 1);
    if (next.getTime() > end.getTime()) break;
    months += 1;
  }
  const after = new Date(start);
  after.setMonth(after.getMonth() + months);
  let rest = end.getTime() - after.getTime();
  const weeks = Math.floor(rest / (7 * 86400000));
  rest -= weeks * 7 * 86400000;
  const days = Math.floor(rest / 86400000);
  rest -= days * 86400000;
  const hours = Math.floor(rest / 3600000);
  return { past, months, weeks, days, hours };
}

function Countdown() {
  const time = useCountdown(wedding.startsAt);
  const units = [
    ["Months", time.months],
    ["Weeks", time.weeks],
    ["Days", time.days],
    ["Hours", time.hours],
  ];

  return (
    <header className="banner countdown-banner">
      <img className="banner-photo" src={images.countdownBg} alt="" />
      <div className="countdown">
        <p className="eyebrow">Countdown the big day</p>
        <div className="ticks" aria-label="Time remaining">
          {units.map(([label, value], index) => (
            <div className="tick" key={label}>
              {index > 0 ? (
                <span className="colon" aria-hidden="true">
                  :
                </span>
              ) : null}
              <div>
                <strong>{String(value).padStart(2, "0")}</strong>
                <span>{label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function PaperBanner({ title }) {
  return (
    <header className="paper-banner">
      <img src={images.paper} alt="" />
      <Reveal className="paper-title">
        <AnimatedText text={title} className="script" as="h2" />
      </Reveal>
    </header>
  );
}

function Event({ item, column, row }) {
  return (
    <Reveal className="event" style={{ gridColumn: column, gridRow: row }}>
      <img className="art event-art" src={item.art} alt="" />
      <AnimatedText text={`${item.time}\n${item.label}`} className="event-copy" />
    </Reveal>
  );
}

function Timeline() {
  const railRef = useRef(null);
  const heartRef = useRef(null);

  useEffect(() => {
    const rail = railRef.current;
    const heart = heartRef.current;
    if (!rail || !heart) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      const rect = rail.getBoundingClientRect();
      const travel = Math.max(0, rect.height - heart.offsetHeight);
      if (reduced) {
        heart.style.top = "0px";
        return;
      }
      const view = window.innerHeight;
      const railTop = rect.top + window.scrollY;
      const scrollStart = railTop - view * 0.7;
      const scrollEnd = railTop + rect.height - view * 0.3;
      const progress = (window.scrollY - scrollStart) / (scrollEnd - scrollStart);
      const clamped = Math.min(1, Math.max(0, progress));
      heart.style.top = `${clamped * travel}px`;
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="timeline">
      <div className="time-rail" ref={railRef}>
        <span className="time-rule" />
        <img ref={heartRef} className="time-heart" src={images.heartSpark} alt="" />
      </div>
      {timelineLeft.map((item, index) => (
        <Event item={item} key={item.label} column={1} row={index + 1} />
      ))}
      {timelineRight.map((item, index) => (
        <Event item={item} key={item.label} column={3} row={index + 1} />
      ))}
    </div>
  );
}

function Cover({ onOpen }) {
  return (
    <section className="cover" id="cover">
      <div className="cover-stage">
        <img className="art bouquet" src={images.bouquet} alt="" />
        <div className="cover-words">
          <AnimatedText
            text="Alice & Alex"
            className="script names play"
            as="h1"
            delay={0.12}
          />
          <AnimatedText
            text="Are Getting Married"
            className="italic play"
            delay={0.48}
          />
        </div>
        <div className="envelope-wrap">
          <img className="art envelope" src={images.envelope} alt="" />
          <div className="wax">
            <img src={images.wax} alt="" />
          </div>
        </div>
        <button type="button" className="prompt" onClick={onOpen}>
          <AnimatedText
            text="Click Envelope to Open"
            className="italic play"
            delay={0.8}
          />
        </button>
      </div>
    </section>
  );
}

function Invitation() {
  const audioRef = useRef(null);
  const [spinning, setSpinning] = useState(false);

  async function toggleRecord() {
    const next = !spinning;
    setSpinning(next);
    const audio = audioRef.current;
    if (!audio) return;
    if (next) {
      try {
        await audio.play();
      } catch {
        setSpinning(false);
      }
    } else {
      audio.pause();
    }
  }

  return (
    <section className="invitation" id="invitation">
      <div className="scene">
        <img
          className="scene-art"
          src={images.pageTwo}
          alt=""
        />
        <img className="polaroid shot-a" src={images.shotA} alt="" />
        <img className="polaroid shot-b" src={images.shotB} alt="" />
        <img className="polaroid shot-c" src={images.shotC} alt="" />
        <Reveal className="card-copy">
          <AnimatedText
            text={"You are invited to\nthe wedding of"}
            className="italic"
            delay={0.1}
          />
          <AnimatedText text="Alice & Alex" className="script names" as="p" delay={0.35} />
          <AnimatedText text={wedding.dateLabel} className="italic date" delay={0.65} />
        </Reveal>
        <button
          className={`record ${spinning ? "is-playing" : ""}`}
          type="button"
          onClick={toggleRecord}
          aria-pressed={spinning}
          aria-label={spinning ? "Pause the record" : "Play the record"}
        >
          <img src={images.record} alt="" />
          <svg className="arc" viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path id="record-arc" d="M28,112 A72,72 0 0 1 172,112" />
            </defs>
            <text>
              <textPath href="#record-arc" startOffset="50%">
                CLICK TO PLAY
              </textPath>
            </text>
          </svg>
          <span className="play-dot" />
        </button>
        <audio ref={audioRef} src="/lover.m4a" preload="auto" />
      </div>
      <Countdown />
    </section>
  );
}

function Details() {
  return (
    <section className="details" id="details">
      <PaperBanner title="The Details" />
      <div className="facts">
        <img className="art couple" src={images.couple} alt="Alice and Alex" />
        <Reveal className="date-block">
          <AnimatedText text="Date:" className="date-kicker" />
          <AnimatedText text={wedding.dateLabel} className="date-value" />
        </Reveal>
        <div className="fact-split">
          <Reveal className="fact">
            <img src={images.hallArt} alt="" />
            <AnimatedText text="Wedding hall:" className="fact-label" />
            <AnimatedText text={wedding.hall} className="fact-value" />
          </Reveal>
          <Reveal className="fact">
            <a className="fact-link" href={wedding.map} target="_blank" rel="noreferrer">
              <img className="pin" src={images.pin} alt="" />
              <AnimatedText text="Location:" className="fact-label" />
              <AnimatedText text={wedding.place} className="fact-value" as="span" />
              <span className="map-hint">Open in Google Maps</span>
            </a>
          </Reveal>
        </div>
      </div>
      <PaperBanner title="Our Timeline" />
      <Timeline />
    </section>
  );
}

function Rsvp() {
  const [name, setName] = useState("");
  const [attending, setAttending] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (!name.trim() || !attending) {
      setError("Please add your name and let us know if you can come.");
      return;
    }
    const reply = { name: name.trim(), attending, at: Date.now() };
    window.localStorage.setItem("alice-alex-rsvp", JSON.stringify(reply));
    setError("");
    setSent(true);
  }

  return (
    <section className="rsvp" id="rsvp">
      <Reveal className="reply-head">
        <AnimatedText
          text={`Kindly reply by ${wedding.replyBy}`}
          className="script"
          as="h2"
        />
      </Reveal>
      <div className="plaque-wrap">
        <img className="plaque" src={images.plaque} alt="" />
        {sent ? (
          <div className="thanks play">
            <AnimatedText text={"Your reply\nis with us"} className="script play" as="h3" />
            <p className="thanks-name">{name}</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <AnimatedText text="Please RSVP" className="script form-title play" as="h3" />
            <label className="field">
              <span>Your full name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </label>
            <fieldset>
              <legend>Will you be attending our wedding?</legend>
              <label className={attending === "yes" ? "choice on" : "choice"}>
                <input
                  type="radio"
                  name="attending"
                  value="yes"
                  checked={attending === "yes"}
                  onChange={() => setAttending("yes")}
                />
                Joyfully accepts
              </label>
              <label className={attending === "no" ? "choice on" : "choice"}>
                <input
                  type="radio"
                  name="attending"
                  value="no"
                  checked={attending === "no"}
                  onChange={() => setAttending("no")}
                />
                Regretfully declines
              </label>
            </fieldset>
            {error && <p className="form-error">{error}</p>}
            <button className="send" type="submit">
              RSVP
            </button>
          </form>
        )}
      </div>
      <img className="maker" src={images.maker} alt="Thread & Vow" />
    </section>
  );
}

export default function App() {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("invite-locked", !opened);
    if (!opened) return undefined;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("invitation")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [opened]);

  function openInvite() {
    if (opened) return;
    setOpened(true);
  }

  return (
    <main>
      <Cover onOpen={openInvite} />
      <Invitation />
      <Details />
      <Rsvp />
    </main>
  );
}
