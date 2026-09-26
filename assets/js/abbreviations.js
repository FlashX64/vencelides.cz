// Enhance native abbr tags with tooltips that also open on tap
(() => {
  if (!window.bootstrap?.Tooltip) return;

  const tooltips = new Map();
  document.querySelectorAll('abbr[title]').forEach((abbr) => {
    const definition = abbr.getAttribute('title');
    if (!definition || abbr.closest('a, button')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'abbreviation-trigger';
    button.setAttribute('aria-label', `${abbr.textContent}: ${definition}`);
    abbr.before(button);
    button.append(abbr);

    const tooltip = new bootstrap.Tooltip(button, {
      title: definition,
      trigger: 'hover click',
      container: 'body',
      placement: 'top',
      html: false,
    });
    abbr.removeAttribute('title');
    tooltips.set(button, tooltip);

    button.addEventListener('show.bs.tooltip', () => {
      tooltips.forEach((other, trigger) => {
        if (trigger !== button) other.hide();
      });
    });
    button.addEventListener('blur', () => tooltip.hide());
  });

  document.addEventListener('click', (event) => {
    tooltips.forEach((tooltip, button) => {
      if (!button.contains(event.target)) tooltip.hide();
    });
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      tooltips.forEach((tooltip) => tooltip.hide());
    }
  });
})();
