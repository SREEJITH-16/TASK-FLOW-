(() => {
  'use strict';

  const TASKS_KEY = 'todo_app_tasks';
  const THEME_KEY = 'todo_app_theme';
  const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

  const $ = (id) => document.getElementById(id);
  const el = {
    list: $('taskList'), empty: $('emptyState'), search: $('searchInput'), sort: $('sortSelect'),
    modal: $('taskModal'), form: $('taskForm'), title: $('titleInput'), desc: $('descInput'),
    priority: $('priorityInput'), due: $('dueInput'), titleErr: $('titleError'),
    titleCount: $('titleCount'), descCount: $('descCount'), submit: $('submitBtn'),
    modalTitle: $('modalTitle'), modalSub: $('modalSub'),
    confirm: $('confirmModal'), toasts: $('toasts'), ring: $('ringFg'),
  };

  const state = { tasks: [], status: 'all', priority: 'all', sort: 'newest', query: '', editingId: null };

  /* ---------- Storage ---------- */
  function loadTasks() {
    try {
      const data = JSON.parse(localStorage.getItem(TASKS_KEY));
      if (!Array.isArray(data)) return [];
      const seen = new Set();
      return data.filter((t) => t && typeof t.id === 'string' && t.id && !seen.has(t.id) && seen.add(t.id) && typeof t.title === 'string' && t.title.trim())
        .map((t) => ({
          id: t.id, title: t.title.trim().slice(0, 100), description: typeof t.description === 'string' ? t.description.slice(0, 300) : '',
          priority: PRIORITY_RANK[t.priority] !== undefined ? t.priority : 'medium',
          dueDate: /^\d{4}-\d{2}-\d{2}$/.test(t.dueDate) ? t.dueDate : '',
          completed: Boolean(t.completed), createdAt: Number(t.createdAt) || Date.now(),
        }));
    } catch { return []; }
  }
  function saveTasks() {
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(state.tasks)); }
    catch { showToast('Could not save – storage is full or blocked', 'danger'); }
  }
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10));

  /* ---------- CRUD ---------- */
  function createTask({ title, description, priority, dueDate }) {
    const task = { id: uid(), title, description, priority, dueDate, completed: false, createdAt: Date.now() };
    state.tasks.unshift(task);
    commit();
    return task;
  }
  function updateTask(id, changes) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return false;
    Object.assign(task, changes);
    commit();
    return true;
  }
  function deleteTask(id) {
    const index = state.tasks.findIndex((t) => t.id === id);
    if (index < 0) return null;
    const [removed] = state.tasks.splice(index, 1);
    commit();
    return { removed, index };
  }
  function toggleTask(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    task.completed = !task.completed;
    commit();
    if (task.completed) showToast('Task marked as completed', 'success');
  }
  function commit() { saveTasks(); render(); }

  /* ---------- Dates ---------- */
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function formatDate(str) {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function dueState(task) {
    if (!task.dueDate || task.completed) return '';
    const today = todayStr();
    return task.dueDate < today ? 'overdue' : task.dueDate === today ? 'today' : '';
  }

  /* ---------- Filtering ---------- */
  function searchTasks(tasks) {
    const q = state.query.trim().toLowerCase();
    return q ? tasks.filter((t) => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : tasks;
  }
  function filterTasks() {
    let result = state.tasks.filter((t) =>
      (state.status === 'all' || (state.status === 'active' ? !t.completed : t.completed)) &&
      (state.priority === 'all' || t.priority === state.priority));
    result = searchTasks(result);
    const sorters = {
      newest: (a, b) => b.createdAt - a.createdAt,
      oldest: (a, b) => a.createdAt - b.createdAt,
      due: (a, b) => (a.dueDate || '9999') < (b.dueDate || '9999') ? -1 : (a.dueDate || '9999') > (b.dueDate || '9999') ? 1 : b.createdAt - a.createdAt,
      priority: (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.createdAt - a.createdAt,
    };
    return result.sort(sorters[state.sort]);
  }

  /* ---------- Rendering ---------- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  function icon(paths, size = 18) {
    const s = document.createElementNS(SVG_NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size);
    s.setAttribute('fill', 'none'); s.setAttribute('stroke', 'currentColor'); s.setAttribute('stroke-width', '2.2');
    s.setAttribute('stroke-linecap', 'round'); s.setAttribute('stroke-linejoin', 'round'); s.setAttribute('aria-hidden', 'true');
    paths.forEach((d) => { const p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', d); s.appendChild(p); });
    return s;
  }
  const ICONS = {
    check: ['M5 12.5l4.5 4.5L19 7.5'],
    edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z'],
    trash: ['M3 6h18', 'M8 6V4h8v2', 'M19 6l-1 14H6L5 6', 'M10 11v6M14 11v6'],
  };
  function make(tag, className, text) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function createTaskElement(task) {
    const li = make('li', 'task' + (task.completed ? ' done' : ''));
    li.dataset.id = task.id;

    const label = make('label', 'check');
    const box = make('input'); box.type = 'checkbox'; box.checked = task.completed; box.dataset.action = 'toggle';
    box.setAttribute('aria-label', `Mark "${task.title}" as ${task.completed ? 'incomplete' : 'completed'}`);
    const tick = make('span'); tick.appendChild(icon(ICONS.check, 16));
    label.append(box, tick);

    const body = make('div', 'body');
    body.appendChild(make('div', 't-title', task.title));
    if (task.description) body.appendChild(make('div', 't-desc', task.description));
    const meta = make('div', 'meta');
    meta.appendChild(make('span', `badge ${task.priority}`, task.priority[0].toUpperCase() + task.priority.slice(1)));
    if (task.dueDate) {
      const ds = dueState(task);
      const label = ds === 'overdue' ? 'Overdue · ' : ds === 'today' ? 'Due today · ' : 'Due ';
      meta.appendChild(make('span', `due ${ds}`, label + formatDate(task.dueDate)));
    }
    meta.appendChild(make('span', '', 'Created ' + new Date(task.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })));
    if (task.completed) meta.appendChild(make('span', '', '✓ Completed'));
    body.appendChild(meta);

    const actions = make('div', 'actions');
    [['edit', 'Edit', ICONS.edit, 'act'], ['delete', 'Delete', ICONS.trash, 'act del']].forEach(([action, name, paths, cls]) => {
      const b = make('button', cls); b.type = 'button'; b.dataset.action = action;
      b.setAttribute('aria-label', `${name} task: ${task.title}`); b.title = name; b.appendChild(icon(paths));
      actions.appendChild(b);
    });
    li.append(label, body, actions);
    return li;
  }

  function renderTasks() {
    const visible = filterTasks();
    const restore = el.list.contains(document.activeElement) ? captureFocus($('addTaskBtn')) : null;
    el.list.replaceChildren(...visible.map(createTaskElement));
    if (restore) restore();
    el.list.hidden = visible.length === 0;
    el.empty.hidden = visible.length !== 0;
    if (visible.length === 0) renderEmpty();
  }

  function renderEmpty() {
    const total = state.tasks.length;
    const filtering = state.query.trim() || state.priority !== 'all';
    let h, p, cta = false;
    if (total === 0) { h = "You're all caught up"; p = 'Create your first task to get started.'; cta = true; }
    else if (filtering) { h = 'No tasks found'; p = 'Try changing your search or filters.'; }
    else if (state.status === 'active') { h = 'No active tasks'; p = 'Everything is completed.'; }
    else { h = 'Nothing completed yet'; p = 'Finished tasks will show up here.'; }
    const wrap = make('div', 'e-icon'); wrap.appendChild(icon(ICONS.check, 30));
    const nodes = [wrap, make('h3', '', h), make('p', '', p)];
    if (cta) { const b = make('button', 'btn primary', 'Add your first task'); b.type = 'button'; b.dataset.action = 'add'; nodes.push(b); }
    el.empty.replaceChildren(...nodes);
  }

  function renderStats() {
    const total = state.tasks.length;
    const done = state.tasks.filter((t) => t.completed).length;
    const active = total - done;
    const overdue = state.tasks.filter((t) => dueState(t) === 'overdue').length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const set = (id, v) => { const n = $(id); if (n) n.textContent = v; };
    set('statTotal', total); set('statActive', active); set('statDone', done); set('statOverdue', overdue);
    set('cntAll', total); set('cntActive', active); set('cntDone', done);
    set('percent', pct + '%');
    set('progressText', total ? `${done} of ${total} tasks completed` : 'Add a task to start tracking progress');
    el.ring.style.strokeDashoffset = 326.7 * (1 - pct / 100);
    $('markAllBtn').disabled = active === 0;
    $('clearDoneBtn').disabled = done === 0;
    const active_ = state.tasks.filter((t) => !t.completed).length;
    $('subGreeting').textContent = total === 0 ? 'Add your first task to get going.' : active_ ? `You have ${active_} active ${active_ === 1 ? 'task' : 'tasks'}.` : 'Everything is done. Nice work.';
  }

  function renderGreeting() {
    const h = new Date().getHours();
    $('greeting').textContent = h < 12 ? 'Good morning!' : h < 18 ? 'Good afternoon!' : 'Good evening!';
  }

  function renderFilterStates() {
    document.querySelectorAll('[data-status]').forEach((b) => { const on = b.dataset.status === state.status; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
    document.querySelectorAll('[data-priority]').forEach((b) => { const on = b.dataset.priority === state.priority; b.classList.toggle('active', on); b.setAttribute('aria-pressed', on); });
  }

  function render() { renderStats(); renderFilterStates(); renderTasks(); }

  /* ---------- Modal ---------- */
  function captureFocus(fallback) {
    const a = document.activeElement;
    const item = a && a.closest ? a.closest('.task') : null;
    const action = a && a.dataset ? a.dataset.action : null;
    if (item && action) {
      const id = item.dataset.id;
      return () => {
        const n = el.list.querySelector(`[data-id="${CSS.escape(id)}"] [data-action="${action}"]`) || fallback;
        if (n) n.focus();
      };
    }
    return () => { if (a && document.contains(a)) a.focus(); else if (fallback) fallback.focus(); };
  }
  function showOverlay(node, focusEl) {
    clearTimeout(node._t);
    node._restore = captureFocus($('addTaskBtn'));
    node.hidden = false;
    document.body.classList.add('modal-open');
    requestAnimationFrame(() => { node.classList.add('open'); focusEl && focusEl.focus(); });
  }
  function hideOverlay(node) {
    if (node.hidden) return;
    node.classList.remove('open');
    clearTimeout(node._t);
    node._t = setTimeout(() => { node.hidden = true; }, 200);
    if (el.modal.hidden || node === el.modal) {
      if (node === el.modal ? el.confirm.hidden : true) document.body.classList.remove('modal-open');
    }
    if (node._restore) node._restore();
  }

  function openModal(taskId = null) {
    const task = taskId ? state.tasks.find((t) => t.id === taskId) : null;
    state.editingId = task ? task.id : null;
    el.form.reset(); clearError();
    el.modalTitle.textContent = task ? 'Edit Task' : 'Add New Task';
    el.modalSub.textContent = task ? 'Update the details of this task' : 'Create a new task to stay organized';
    el.submit.textContent = task ? 'Save Changes' : 'Add Task';
    el.submit.disabled = false;
    el.title.value = task ? task.title : '';
    el.desc.value = task ? task.description : '';
    el.priority.value = task ? task.priority : 'medium';
    el.due.value = task ? task.dueDate : '';
    updateCounts();
    showOverlay(el.modal, el.title);
  }
  function closeModal() { if (!el.modal.hidden) hideOverlay(el.modal); state.editingId = null; }

  function updateCounts() {
    el.titleCount.textContent = `${el.title.value.length}/100`;
    el.descCount.textContent = `${el.desc.value.length}/300`;
  }
  function clearError() { el.titleErr.hidden = true; el.title.classList.remove('invalid'); el.title.removeAttribute('aria-invalid'); }

  function handleSubmit(e) {
    e.preventDefault();
    if (el.submit.disabled) return;
    const title = el.title.value.trim();
    if (!title) {
      el.titleErr.textContent = 'Please enter a task title.';
      el.titleErr.hidden = false; el.title.classList.add('invalid'); el.title.setAttribute('aria-invalid', 'true'); el.title.focus();
      return;
    }
    el.submit.disabled = true;
    const data = { title, description: el.desc.value.trim(), priority: el.priority.value, dueDate: el.due.value };
    if (state.editingId) {
      if (updateTask(state.editingId, data)) showToast('Task updated', 'success');
      else showToast('That task no longer exists', 'danger');
    }
    else { createTask(data); showToast('Task added successfully', 'success'); }
    closeModal();
  }

  /* ---------- Confirm ---------- */
  function askConfirm({ title, text, okLabel }) {
    if (!el.confirm.hidden) return Promise.resolve(false);
    return new Promise((resolve) => {
      $('confirmTitle').textContent = title; $('confirmText').textContent = text; $('confirmOk').textContent = okLabel;
      showOverlay(el.confirm, $('confirmCancel'));
      const finish = (val) => {
        $('confirmOk').onclick = $('confirmCancel').onclick = el.confirm.onclick = null;
        hideOverlay(el.confirm); resolve(val);
      };
      $('confirmOk').onclick = () => finish(true);
      $('confirmCancel').onclick = () => finish(false);
      el.confirm.onclick = (ev) => { if (ev.target === el.confirm) finish(false); };
    });
  }

  async function handleDelete(id) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    const ok = await askConfirm({ title: 'Delete task?', text: `"${task.title}" will be permanently deleted.`, okLabel: 'Delete' });
    if (!ok) return;
    const node = el.list.querySelector(`[data-id="${CSS.escape(id)}"]`);
    if (node) { node.classList.add('removing'); await new Promise((r) => setTimeout(r, 220)); }
    const result = deleteTask(id);
    if (result) showToast('Task deleted', 'danger', { label: 'Undo', onClick: () => { state.tasks.splice(Math.min(result.index, state.tasks.length), 0, result.removed); commit(); showToast('Task restored', 'success'); } });
  }

  /* ---------- Toasts ---------- */
  function showToast(message, type = 'info', action) {
    const t = make('div', `toast ${type}`);
    t.appendChild(make('span', '', message));
    const dismiss = () => { t.classList.add('out'); setTimeout(() => t.remove(), 250); };
    if (action) { const b = make('button', '', action.label); b.type = 'button'; b.onclick = () => { action.onClick(); dismiss(); }; t.appendChild(b); }
    el.toasts.appendChild(t);
    while (el.toasts.children.length > 3) el.toasts.firstChild.remove();
    setTimeout(dismiss, action ? 6000 : 2800);
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const btn = $('themeToggle');
    btn.setAttribute('aria-pressed', theme === 'dark');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch { /* ignore */ }
  }

  /* ---------- Events ---------- */
  function bindEvents() {
    el.list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]'); const item = e.target.closest('.task');
      if (!btn || !item) return;
      const id = item.dataset.id;
      if (btn.dataset.action === 'edit') openModal(id);
      else if (btn.dataset.action === 'delete') handleDelete(id);
    });
    el.list.addEventListener('change', (e) => {
      if (e.target.dataset.action === 'toggle') toggleTask(e.target.closest('.task').dataset.id);
    });
    el.empty.addEventListener('click', (e) => { if (e.target.closest('[data-action="add"]')) openModal(); });

    $('statusFilters').addEventListener('click', (e) => { const b = e.target.closest('[data-status]'); if (b) { state.status = b.dataset.status; render(); } });
    $('priorityFilters').addEventListener('click', (e) => { const b = e.target.closest('[data-priority]'); if (b) { state.priority = b.dataset.priority; render(); } });
    el.sort.addEventListener('change', () => { state.sort = el.sort.value; render(); });
    el.search.addEventListener('input', () => { state.query = el.search.value; renderTasks(); });

    $('addTaskBtn').addEventListener('click', () => openModal());
    $('themeToggle').addEventListener('click', toggleTheme);
    $('markAllBtn').addEventListener('click', () => {
      state.tasks.forEach((t) => { t.completed = true; }); commit(); showToast('All tasks marked as completed', 'success');
    });
    $('clearDoneBtn').addEventListener('click', async () => {
      const n = state.tasks.filter((t) => t.completed).length; if (!n) return;
      const ok = await askConfirm({ title: 'Clear completed tasks?', text: `${n} completed ${n === 1 ? 'task' : 'tasks'} will be permanently deleted.`, okLabel: 'Clear completed' });
      if (!ok) return;
      state.tasks = state.tasks.filter((t) => !t.completed); commit(); showToast('Completed tasks cleared', 'danger');
    });

    el.form.addEventListener('submit', handleSubmit);
    el.title.addEventListener('input', () => { clearError(); updateCounts(); });
    el.desc.addEventListener('input', updateCounts);
    let downTarget = null;
    el.modal.addEventListener('mousedown', (e) => { downTarget = e.target; });
    el.modal.addEventListener('click', (e) => {
      if ((e.target === el.modal && downTarget === el.modal) || e.target.closest('[data-close]')) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!el.confirm.hidden) { $('confirmCancel').click(); }
        else if (!el.modal.hidden) closeModal();
        return;
      }
      const dialog = !el.confirm.hidden ? el.confirm : !el.modal.hidden ? el.modal : null;
      if (e.key === 'Tab' && dialog) { // keep focus inside the open dialog
        const f = [...dialog.querySelectorAll('button,input,select,textarea')].filter((n) => !n.disabled && n.getClientRects().length);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (!dialog.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
        else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
      if (e.key.toLowerCase() === 'n' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey && el.modal.hidden && el.confirm.hidden) {
        e.preventDefault(); openModal();
      }
    });
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      let saved = null; try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
      if (!saved) applyTheme(e.matches ? 'dark' : 'light');
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderGreeting(); render(); } });
    window.addEventListener('storage', (e) => { if (e.key === TASKS_KEY) { state.tasks = loadTasks(); render(); } });
  }

  /* ---------- Init ---------- */
  function init() {
    applyTheme(document.documentElement.dataset.theme || 'light');
    state.tasks = loadTasks();
    renderGreeting();
    bindEvents();
    render();
  }
  init();
})();
