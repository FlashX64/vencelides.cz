window.replayHomeIntro = () => {
  localStorage.removeItem("crane-intro:last-played");
  window.location.reload();
};
