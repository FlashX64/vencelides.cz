import { elements, requiredElement } from "./dom";

interface InlineVideo extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void;
}

const time = (seconds: number) => {
  const value = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;

  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
};

elements(".project-player").forEach((player) => {
  const video = player.querySelector<InlineVideo>("video");

  if (!video) {
    return;
  }

  const controls = requiredElement(".project-player-controls", player);
  const stage = requiredElement(".project-player-stage", player);
  const volumeControls = player.dataset.volumeControls !== "false";
  const play = requiredElement<HTMLButtonElement>("[data-video-play]", player);
  const mute = player.querySelector<HTMLButtonElement>("[data-video-mute]");
  const loop = requiredElement<HTMLButtonElement>("[data-video-loop]", player);
  const volumeToggle = player.querySelector<HTMLButtonElement>(
    "[data-video-volume-toggle]",
  );
  const volumePanel = player.querySelector<HTMLElement>(
    "[data-video-volume-panel]",
  );
  const seek = requiredElement<HTMLInputElement>("[data-video-seek]", player);
  const volume = player.querySelector<HTMLInputElement>("[data-video-volume]");
  const fullscreen = requiredElement<HTMLButtonElement>(
    "[data-video-fullscreen]",
    player,
  );
  const message = requiredElement("[data-video-message]", player);

  let hideControlsTimer: number | undefined;
  let revealOnly = false;

  const showControls = () => {
    player.classList.add("is-controls-visible");
    window.clearTimeout(hideControlsTimer);
    hideControlsTimer = window.setTimeout(() => {
      player.classList.remove("is-controls-visible");
    }, 2500);
  };

  stage.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "touch") {
      showControls();
    }
  });

  stage.addEventListener("pointerdown", (event) => {
    // The first tap reveals hidden controls without also pausing the video
    revealOnly =
      event.pointerType === "touch" &&
      event.target === video &&
      !video.paused &&
      !player.classList.contains("is-controls-visible");
    showControls();
    window.clearTimeout(hideControlsTimer);
  });

  stage.addEventListener("pointerup", showControls);

  stage.addEventListener("pointercancel", () => {
    revealOnly = false;
    showControls();
  });

  stage.addEventListener("pointerleave", (event) => {
    // Touch pointers leave the element when the finger lifts
    if (event.pointerType === "mouse") {
      player.classList.remove("is-controls-visible");
    }
  });

  player.addEventListener("focusin", showControls);

  // Upgrade once, keeping HD after fullscreen to avoid another reload on exit
  let restoreState: {
    time: number;
    playing: boolean;
    fallback: string;
  } | null = null;

  const upgradeQuality = () => {
    const source = video.dataset.fullscreenSrc;

    if (
      !source ||
      restoreState ||
      new URL(source, location.href).href === video.currentSrc
    ) {
      return;
    }

    restoreState = {
      time: video.currentTime,
      playing: !video.paused && !video.ended,
      fallback: video.currentSrc || video.src,
    };
    video.src = source;
    video.load();
  };

  // The replacement source needs metadata before we can restore playback position
  video.addEventListener("loadedmetadata", () => {
    if (restoreState) {
      video.currentTime = Math.min(
        restoreState.time,
        Number.isFinite(video.duration) ? video.duration : restoreState.time,
      );
    }
  });

  video.addEventListener("canplay", () => {
    if (!restoreState) {
      return;
    }

    const resume = restoreState.playing;

    restoreState = null;

    if (resume) {
      void video.play().catch(() => showControls());
    }
  });

  const notify = (text: string) => {
    message.textContent = text;
    message.hidden = !text;
  };

  const updatePlayback = () => {
    const paused = video.paused || video.ended;

    player.classList.toggle("is-paused", paused);
    play.setAttribute("aria-label", paused ? "Play video" : "Pause video");
    requiredElement("[data-play-icon]", player).toggleAttribute(
      "hidden",
      !paused,
    );
    requiredElement("[data-pause-icon]", player).toggleAttribute(
      "hidden",
      paused,
    );
  };

  const updateTime = () => {
    const duration = video.duration;

    seek.disabled = !Number.isFinite(duration) || duration <= 0;
    seek.value = seek.disabled
      ? "0"
      : String((video.currentTime / duration) * 100);
    seek.style.setProperty("--video-progress", `${seek.value}%`);
    seek.setAttribute(
      "aria-valuetext",
      `${time(video.currentTime)} of ${time(duration)}`,
    );
    requiredElement("[data-video-time]", player).textContent =
      `${time(video.currentTime)} / ${time(duration)}`;
  };

  const updateVolume = () => {
    if (!volumeControls || !mute || !volume) {
      if (!video.muted) {
        video.muted = true;
      }

      return;
    }

    const silent = video.muted || video.volume === 0;

    mute.setAttribute("aria-label", silent ? "Unmute video" : "Mute video");
    mute.setAttribute("aria-pressed", String(silent));
    requiredElement("[data-muted-icon]", player).toggleAttribute(
      "hidden",
      !silent,
    );
    requiredElement("[data-volume-icon]", player).toggleAttribute(
      "hidden",
      silent,
    );
    volume.value = String(silent ? 0 : video.volume);
    volume.style.setProperty(
      "--video-progress",
      `${Number(volume.value) * 100}%`,
    );
    volume.setAttribute(
      "aria-valuetext",
      `${Math.round(Number(volume.value) * 100)} percent`,
    );
  };

  const togglePlayback = async () => {
    if (!video.paused) {
      video.pause();

      return;
    }

    try {
      await video.play();
      notify("");
    } catch {
      notify("Unable to play this video. Please try again.");
    }
  };

  play.addEventListener("click", togglePlayback);

  loop.addEventListener("click", () => {
    video.loop = !video.loop;
    loop.setAttribute("aria-pressed", String(video.loop));
  });

  const setVolumeExpanded = (expanded: boolean) => {
    if (!volumePanel || !volumeToggle) {
      return;
    }

    volumePanel.hidden = !expanded;
    volumeToggle.setAttribute("aria-expanded", String(expanded));
    volumeToggle.setAttribute(
      "aria-label",
      expanded ? "Hide volume controls" : "Show volume controls",
    );
  };

  volumeToggle?.addEventListener("click", () => {
    if (volumeControls && volumePanel) {
      setVolumeExpanded(volumePanel.hidden);
    }
  });

  volumePanel?.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      setVolumeExpanded(false);
      volumeToggle?.focus();
    }
  });

  video.addEventListener("click", () => {
    if (revealOnly) {
      revealOnly = false;

      return;
    }

    void togglePlayback();
  });

  seek.addEventListener("input", () => {
    if (!seek.disabled) {
      video.currentTime = (Number(seek.value) / 100) * video.duration;
      updateTime();
    }
  });

  mute?.addEventListener("click", () => {
    if (!volumeControls || !mute || !volume) {
      return;
    }

    if (video.muted || video.volume === 0) {
      if (video.volume === 0) {
        video.volume = 1;
      }

      video.muted = false;
    } else {
      video.muted = true;
    }
  });

  volume?.addEventListener("input", () => {
    if (!volumeControls || !mute || !volume) {
      return;
    }

    video.volume = Number(volume.value);
    video.muted = video.volume === 0;
  });

  fullscreen.hidden =
    !document.fullscreenEnabled && !video.webkitEnterFullscreen;

  fullscreen.addEventListener("click", async () => {
    try {
      if (document.fullscreenElement === player) {
        await document.exitFullscreen();
      } else if (document.fullscreenEnabled) {
        await player.requestFullscreen();
      } else {
        video.webkitEnterFullscreen?.();
      }
    } catch {
      notify("Fullscreen is unavailable in this browser.");
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === player) {
      upgradeQuality();
      showControls();
    }

    fullscreen.setAttribute(
      "aria-label",
      document.fullscreenElement === player
        ? "Exit fullscreen"
        : "Enter fullscreen",
    );
  });

  video.addEventListener("webkitbeginfullscreen", upgradeQuality);
  video.addEventListener("play", updatePlayback);
  video.addEventListener("pause", updatePlayback);
  video.addEventListener("ended", updatePlayback);
  video.addEventListener("timeupdate", updateTime);
  video.addEventListener("durationchange", updateTime);
  video.addEventListener("loadedmetadata", updateTime);
  video.addEventListener("volumechange", updateVolume);

  video.addEventListener("error", () => {
    if (restoreState?.fallback) {
      const original = restoreState.fallback;

      restoreState.fallback = "";
      video.src = original;
      video.load();
      notify("Higher quality is unavailable. Using the original video.");
    } else {
      restoreState = null;
      notify("This video could not be loaded.");
    }
  });

  updatePlayback();
  updateTime();
  updateVolume();
  // Native controls remain available if JavaScript cannot initialise the player
  controls.hidden = false;
  video.controls = false;
});
