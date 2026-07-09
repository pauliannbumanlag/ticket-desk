/* ============================================
   STATE
   ============================================ */
const STORAGE_KEY = 'ticket-desk::tickets';

/** @typedef {{id: string, number: number, title: string, description: string,
 *  priority: 'low'|'medium'|'high'|'urgent', status: 'open'|'in-progress'|'done',
 *  due: string, createdAt: number}} Ticket */

/** @type {Ticket[]} */
let tickets = loadTickets();
let editingId = null;

/* ============================================
   PERSISTENCE
   ============================================ */
function loadTickets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedTickets();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : seedTickets();
  } catch (err) {
    console.error('Could not read saved tickets, starting fresh.', err);
    return seedTickets();
  }
}

function saveTickets() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Could not save tickets.', err);
  }
}

function seedTickets() {
  const now = Date.now();
  return [
    {
      id: crypto.randomUUID(),
      number: 1,
      title: 'Fix broken checkout button on mobile Safari',
      description: 'Button is unresponsive on iOS 17 Safari, works fine on Chrome.',
      priority: 'urgent',
      status: 'in-progress',
      due: '',
      createdAt: now - 1000 * 60 * 60 * 26,
    },
    {
      id: crypto.randomUUID(),
      number: 2,
      title: 'Update footer copyright year across templates',
      description: 'Currently hardcoded to last year on 3 legacy templates.',
      priority: 'low',
      status: 'open',
      due: '',
      createdAt: now - 1000 * 60 * 60 * 4,
    },
    {
      id: crypto.randomUUID(),
      number: 3,
      title: 'Investigate slow page load on product listing',
      description: 'Client reports 6s+ load time. Suspect unoptimized images.',
      priority: 'high',
      status: 'open',
      due: '',
      createdAt: now - 1000 * 60 * 30,
    },
  ];
}

function nextTicketNumber() {
  return tickets.reduce((max, t) => Math.max(max, t.number), 0) + 1;
}

/* ============================================
   DOM REFERENCES
   ============================================ */
const el = {
  statOpen: document.getElementById('statOpen'),
  statProgress: document.getElementById('statProgress'),
  statDone: document.getElementById('statDone'),
  search: document.getElementById('searchInput'),
  statusFilter: document.getElementById('statusFilter'),
  priorityFilter: document.getElementById('priorityFilter'),
  sortBy: document.getElementById('sortBy'),
  newTicketBtn: document.getElementById('newTicketBtn'),
  form: document.getElementById('form'),
  formSection: document.getElementById('ticketForm'),
  editingId: document.getElementById('editingId'),
  titleInput: document.getElementById('titleInput'),
  descInput: document.getElementById('descInput'),
  priorityInput: document.getElementById('priorityInput'),
  statusInput: document.getElementById('statusInput'),
  dueInput: document.getElementById('dueInput'),
  cancelBtn: document.getElementById('cancelBtn'),
  submitBtn: document.getElementById('submitBtn'),
  list: document.getElementById('ticketList'),
  emptyState: document.getElementById('emptyState'),
};

/* ============================================
   RENDERING
   ============================================ */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function formatDue(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getFilteredSortedTickets() {
  const query = el.search.value.trim().toLowerCase();
  const statusVal = el.statusFilter.value;
  const priorityVal = el.priorityFilter.value;

  let result = tickets.filter((t) => {
    const matchesQuery = !query || t.title.toLowerCase().includes(query);
    const matchesStatus = statusVal === 'all' || t.status === statusVal;
    const matchesPriority = priorityVal === 'all' || t.priority === priorityVal;
    return matchesQuery && matchesStatus && matchesPriority;
  });

  const priorityRank = { urgent: 4, high: 3, medium: 2, low: 1 };

  switch (el.sortBy.value) {
    case 'created-asc':
      result.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'priority':
      result.sort((a, b) => priorityRank[b.priority] - priorityRank[a.priority]);
      break;
    case 'due':
      result.sort((a, b) => {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return new Date(a.due) - new Date(b.due);
      });
      break;
    case 'created-desc':
    default:
      result.sort((a, b) => b.createdAt - a.createdAt);
  }

  return result;
}

function render() {
  const visible = getFilteredSortedTickets();

  el.statOpen.textContent = tickets.filter((t) => t.status === 'open').length;
  el.statProgress.textContent = tickets.filter((t) => t.status === 'in-progress').length;
  el.statDone.textContent = tickets.filter((t) => t.status === 'done').length;

  el.list.innerHTML = '';

  if (visible.length === 0) {
    el.emptyState.hidden = false;
    return;
  }
  el.emptyState.hidden = true;

  const statusLabels = { open: 'Open', 'in-progress': 'In progress', done: 'Closed' };

  for (const t of visible) {
    const due = formatDue(t.due);
    const article = document.createElement('article');
    article.className = `ticket${t.status === 'done' ? ' ticket--done' : ''}`;
    article.innerHTML = `
      <div class="ticket__stub">
        <span class="ticket__id">#TCK-${String(t.number).padStart(4, '0')}</span>
        <span class="ticket__stamp ticket__stamp--${t.priority}">${t.priority}</span>
      </div>
      <div class="ticket__perf"></div>
      <div class="ticket__body">
        <div class="ticket__header">
          <h3 class="ticket__title">${escapeHtml(t.title)}</h3>
          <div class="ticket__actions">
            <button class="icon-btn" data-action="edit" data-id="${t.id}">Edit</button>
            <button class="icon-btn" data-action="delete" data-id="${t.id}">Delete</button>
          </div>
        </div>
        ${t.description ? `<p class="ticket__desc">${escapeHtml(t.description)}</p>` : ''}
        <div class="ticket__meta">
          <span class="ticket__status ticket__status--${t.status}">${statusLabels[t.status]}</span>
          ${due ? `<span>Due ${due}</span>` : ''}
        </div>
      </div>
    `;
    el.list.appendChild(article);
  }
}

/* ============================================
   FORM HANDLING
   ============================================ */
function openForm(ticket = null) {
  editingId = ticket ? ticket.id : null;
  el.editingId.value = editingId || '';

  el.titleInput.value = ticket ? ticket.title : '';
  el.descInput.value = ticket ? ticket.description : '';
  el.priorityInput.value = ticket ? ticket.priority : 'medium';
  el.statusInput.value = ticket ? ticket.status : 'open';
  el.dueInput.value = ticket ? ticket.due : '';

  el.submitBtn.textContent = ticket ? 'Save changes' : 'Add ticket';
  el.formSection.hidden = false;
  el.titleInput.focus();
}

function closeForm() {
  el.form.reset();
  editingId = null;
  el.formSection.hidden = true;
}

function handleSubmit(evt) {
  evt.preventDefault();

  const title = el.titleInput.value.trim();
  if (!title) {
    el.titleInput.focus();
    return;
  }

  if (editingId) {
    const t = tickets.find((x) => x.id === editingId);
    if (t) {
      t.title = title;
      t.description = el.descInput.value.trim();
      t.priority = el.priorityInput.value;
      t.status = el.statusInput.value;
      t.due = el.dueInput.value;
    }
  } else {
    tickets.push({
      id: crypto.randomUUID(),
      number: nextTicketNumber(),
      title,
      description: el.descInput.value.trim(),
      priority: el.priorityInput.value,
      status: el.statusInput.value,
      due: el.dueInput.value,
      createdAt: Date.now(),
    });
  }

  saveTickets();
  closeForm();
  render();
}

function handleListClick(evt) {
  const btn = evt.target.closest('button[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return;

  if (action === 'edit') {
    openForm(ticket);
  } else if (action === 'delete') {
    const confirmed = window.confirm(`Delete ticket #TCK-${String(ticket.number).padStart(4, '0')}? This can't be undone.`);
    if (!confirmed) return;
    tickets = tickets.filter((t) => t.id !== id);
    saveTickets();
    render();
  }
}

/* ============================================
   EVENT WIRING
   ============================================ */
el.newTicketBtn.addEventListener('click', () => {
  if (!el.formSection.hidden && !editingId) {
    closeForm();
  } else {
    openForm();
  }
});

el.cancelBtn.addEventListener('click', closeForm);
el.form.addEventListener('submit', handleSubmit);
el.list.addEventListener('click', handleListClick);

el.search.addEventListener('input', render);
el.statusFilter.addEventListener('change', render);
el.priorityFilter.addEventListener('change', render);
el.sortBy.addEventListener('change', render);

document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && !el.formSection.hidden) {
    closeForm();
  }
});

/* ============================================
   INIT
   ============================================ */
saveTickets();
render();
