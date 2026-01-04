// public/js/dashboard-live-search.js
(() => {
  // Header search box (from _header.pug)
  const input = document.getElementById('searchInput');
  if (!input) return;

  // Photo cards (we added .photo-card in dashboard.pug)
  const cards = Array.from(document.querySelectorAll('.photo-card'));
  if (!cards.length) return;

  const norm = (v) => (v ?? '').toString().toLowerCase().trim();

  const haystackFor = (card) => {
    // Search ALL fields
    const title = card.dataset.title || '';
    const caption = card.dataset.caption || '';
    const url = card.dataset.url || '';
    const id = card.dataset.id || '';
    const location = card.dataset.location || '';
    const peoplePresent = card.dataset.people || '';
    return norm(`${title} ${caption} ${url} ${id} ${location} ${peoplePresent}`);
  };

  const applyFilter = () => {
    const q = norm(input.value);
    let visible = 0;

    for (const card of cards) {
      const match = q === '' || haystackFor(card).includes(q);
      card.style.display = match ? '' : 'none';
      if (match) visible++;
    }

    // Optional: quick UX feedback in the placeholder
    // (comment out if you don't want this behavior)
    if (q) {
      input.dataset.prevPlaceholder ??= input.placeholder;
      input.placeholder = `Showing ${visible}/${cards.length}`;
    } else if (input.dataset.prevPlaceholder) {
      input.placeholder = input.dataset.prevPlaceholder;
    }
  };

  // Live as you type
  input.addEventListener('input', applyFilter);

  // If the header is “clickable” / reused across pages:
  // re-run when focused so it updates immediately.
  input.addEventListener('focus', applyFilter);

  // Run once on load
  applyFilter();
})();
