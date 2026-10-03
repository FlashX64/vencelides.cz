(() => {
  // Skip the intro for recognized crawlers
  if (
    /bot|crawler|spider|slurp|bingpreview|google-inspectiontool|facebookexternalhit|facebot|ia_archiver|archive\.org_bot/i.test(
      navigator.userAgent,
    )
  ) {
    return;
  }

  const root = document.documentElement;
  const key = "crane-intro:last-played";
  const cooldown = 5 * 60 * 1000;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Skip the intro if reduced motion requested
  if (reducedMotion.matches) {
    return;
  }

  // Read CSS durations so fallback timers stay in sync with the animation
  const timing = getComputedStyle(root);

  const duration = (name) => {
    return parseFloat(timing.getPropertyValue(`--intro-${name}`)) || 0;
  };

  try {
    const lastPlayed = Number(localStorage.getItem(key));

    if (lastPlayed > 0 && Date.now() - lastPlayed < cooldown) {
      return;
    }
  } catch {
    // If storage is unavailable, skip the intro to avoid replaying it on every visit
    return;
  }

  root.classList.add("home-intro-pending");

  let finished = false;
  let started = false;
  let exiting = false;
  let craneStarted = false;
  let timer;

  function finish() {
    finished = true;
    clearTimeout(timer);

    root.classList.remove(
      "home-intro-pending",
      "home-intro-presenting",
      "home-intro-playing",
      "home-intro-exiting",
    );

    document.getElementById("home-intro")?.remove();

    document.removeEventListener("visibilitychange", start);
    document.removeEventListener("keydown", onKey);
  }

  function onKey(event) {
    if (event.key === "Escape") {
      finish();
    }
  }

  function revealPage() {
    if (finished || exiting) {
      return;
    }

    if (reducedMotion.matches) {
      return finish();
    }

    exiting = true;
    clearTimeout(timer);

    root.classList.add("home-intro-exiting");
    timer = setTimeout(
      finish,
      duration("exit-delay") + duration("fade-duration") + 100,
    );
  }

  function playCrane() {
    if (finished || craneStarted) {
      return;
    }

    if (reducedMotion.matches) {
      return finish();
    }

    craneStarted = true;
    clearTimeout(timer);

    root.classList.add("home-intro-playing");
    timer = setTimeout(revealPage, duration("crane-duration") + 300);
  }

  function start() {
    if (
      finished ||
      started ||
      document.hidden ||
      document.readyState !== "complete"
    ) {
      return;
    }

    const template = document.getElementById("home-intro-template");

    if (!template || reducedMotion.matches) {
      return finish();
    }

    try {
      // Recheck after loading: another tab may have played it in the meantime
      const lastPlayed = Number(localStorage.getItem(key));
      if (lastPlayed > 0 && Date.now() - lastPlayed < cooldown) {
        return finish();
      }

      localStorage.setItem(key, String(Date.now()));
    } catch {
      return finish();
    }

    started = true;
    clearTimeout(timer);

    document.body.appendChild(template.content.cloneNode(true));
    template.remove();

    const overlay = document.getElementById("home-intro");
    root.classList.add("home-intro-presenting");

    overlay.addEventListener("animationend", (event) => {
      if (event.animationName === "crane-flight") {
        revealPage();
      }

      if (event.animationName === "home-intro-fade") {
        finish();
      }
    });

    playCrane();
  }

  document.addEventListener("keydown", onKey);
  document.addEventListener("visibilitychange", start);

  window.addEventListener("load", start, { once: true });
  window.addEventListener("pagehide", finish, { once: true });

  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      finish();
    }
  });

  timer = setTimeout(finish, 8000);
})();
