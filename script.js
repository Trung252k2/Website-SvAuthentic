// Accordion toggle logic
document.querySelectorAll('.accordion-header').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.accordion-item');
    const container = btn.closest('#workflow');

    // Close others if you want only one open at a time:
    container.querySelectorAll('.accordion-item').forEach(it => {
      if (it !== item) it.classList.remove('active');
    });

    item.classList.toggle('active');
  });
});

// Collapse toggle for small card heads (info)
document.querySelectorAll('.toggle-collapse').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.querySelector(btn.getAttribute('data-target'));
    if (!target) return;
    const isHidden = getComputedStyle(target).display === 'none';
    target.style.display = isHidden ? 'block' : 'none';
    btn.textContent = isHidden ? '▲' : '▼';
  });

  // default: show
  const t = document.querySelector(btn.getAttribute('data-target'));
  if (t) t.style.display = 'block';
});

// Build progress bar automatically from timeline table
(function buildProgressFromTable(){
  const table = document.getElementById('timelineTable');
  if (!table) return;

  // Gather phases in order of appearance
  const rows = Array.from(table.querySelectorAll('tbody tr'));
  const phaseOrder = [];
  const phaseMap = {}; // phase => statuses array

  rows.forEach(r => {
    const phaseCell = r.cells[1].textContent.trim();
    const statusCell = r.cells[3].textContent.trim().toLowerCase();
    if (!phaseOrder.includes(phaseCell)) phaseOrder.push(phaseCell);
    if (!phaseMap[phaseCell]) phaseMap[phaseCell] = [];
    phaseMap[phaseCell].push(statusCell);
  });

  // Determine status for each phase:
  // - completed: all rows completed
  // - inprogress: any 'in progress'
  // - pending: otherwise
  const phaseStatus = phaseOrder.map(phase => {
    const statuses = phaseMap[phase];
    if (statuses.every(s => s.includes('completed'))) return 'completed';
    if (statuses.some(s => s.includes('in progress') || s.includes('inprogress') || s.includes('in-progress'))) return 'inprogress';
    if (statuses.some(s => s.includes('pending'))) return 'pending';
    // fallback
    return 'pending';
  });

  // Find active (first non-completed)
  let activeIndex = phaseStatus.findIndex(s => s !== 'completed');
  if (activeIndex === -1) activeIndex = phaseStatus.length - 1; // all done -> last

  // Render progress steps
  const progressBar = document.getElementById('progressBar');
  progressBar.innerHTML = '';
  phaseOrder.forEach((phase, idx) => {
    const div = document.createElement('div');
    div.className = 'progress-step';
    const derived = phaseStatus[idx];
    // If earlier phases are completed, mark them completed
    if (idx < activeIndex) div.classList.add('completed');
    else if (idx === activeIndex) div.classList.add('inprogress');
    else div.classList.add('pending');

    div.textContent = phase;
    progressBar.appendChild(div);
  });

  // also style status cells in table (optional)
  rows.forEach(r => {
    const st = r.cells[3].textContent.trim().toLowerCase();
    r.cells[3].classList.remove('st-completed','st-pending','st-inprogress');
    if (st.includes('completed')) r.cells[3].classList.add('st-completed');
    else if (st.includes('in progress') || st.includes('inprogress')) r.cells[3].classList.add('st-inprogress');
    else r.cells[3].classList.add('st-pending');
  });
})();

// small enhancement: map table status classes to colors
const style = document.createElement('style');
style.innerHTML = `
  .st-completed{background:#06220b;color:#fff;padding:6px;border-radius:6px;font-weight:700;text-align:center}
  .st-inprogress{background:#fff7cc;color:#1b1300;padding:6px;border-radius:6px;font-weight:700;text-align:center}
  .st-pending{background:#6b7280;color:#fff;padding:6px;border-radius:6px;font-weight:700;text-align:center}
`;
document.head.appendChild(style);
