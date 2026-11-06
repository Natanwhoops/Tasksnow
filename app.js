// Lista de tarefas: todos os dados são guardados localmente no navegador.
(() => {
  const KEY = "minhas-tarefas-app-v2";
  const $ = s => document.querySelector(s);
  const priorityNames = {high:"Alta", medium:"Média", low:"Baixa"};
  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  };

  function readData() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY));
      if (!data || !Array.isArray(data.tasks)) return {tasks:[], date:todayKey()};
      // Na primeira abertura de um novo dia, reabre as tarefas concluídas.
      if (data.date !== todayKey()) data.tasks.forEach(t => t.done = false);
      data.date = todayKey();
      return data;
    } catch {
      return {tasks:[], date:todayKey()};
    }
  }

  let data = readData();
  let tab = "pending";
  let draggingId = null;

  function save() {
    data.date = todayKey();
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function move(id, offset) {
    const pending = data.tasks.filter(t => !t.done);
    const i = pending.findIndex(t => t.id === id), j = i + offset;
    if (i < 0 || j < 0 || j >= pending.length) return;
    const a = data.tasks.findIndex(t => t.id === pending[i].id);
    const b = data.tasks.findIndex(t => t.id === pending[j].id);
    [data.tasks[a], data.tasks[b]] = [data.tasks[b], data.tasks[a]];
    save(); render();
  }

  function reorder(source, target) {
    const pending = data.tasks.filter(t => !t.done);
    const from = pending.findIndex(t => t.id === source);
    const to = pending.findIndex(t => t.id === target);
    if (from < 0 || to < 0) return;
    const [item] = pending.splice(from, 1);
    pending.splice(to, 0, item);
    data.tasks = [...pending, ...data.tasks.filter(t => t.done)];
    save(); render();
  }

  function actionButton(text, label, callback, extra="") {
    const b = document.createElement("button");
    b.type = "button"; b.textContent = text; b.title = label; b.setAttribute("aria-label", label);
    if (extra) b.className = extra;
    b.addEventListener("click", callback);
    return b;
  }

  function renderTask(t) {
    const li = document.createElement("li");
    li.className = "task" + (t.done ? " completed" : "");
    li.dataset.id = t.id;

    const handle = document.createElement("span");
    handle.className = "handle"; handle.textContent = t.done ? "" : "⠿";
    handle.title = "Arraste para reordenar";
    li.append(handle);

    li.append(actionButton(t.done ? "✓" : "", t.done ? "Marcar como pendente" : "Concluir tarefa", () => {
      t.done = !t.done; save(); render();
    }, "check" + (t.done ? " done" : "")));

    const name = document.createElement("span");
    name.className = "name"; name.textContent = t.title; li.append(name);

    const priority = document.createElement("span");
    priority.className = "priority " + t.priority;
    priority.textContent = priorityNames[t.priority] || "Média"; li.append(priority);

    const actions = document.createElement("div"); actions.className = "actions";
    if (!t.done) {
      actions.append(actionButton("↑", "Mover para cima", () => move(t.id, -1)));
      actions.append(actionButton("↓", "Mover para baixo", () => move(t.id, 1)));
    }
    actions.append(actionButton("×", "Excluir tarefa", () => {
      data.tasks = data.tasks.filter(x => x.id !== t.id); save(); render();
    }, "delete"));
    li.append(actions);

    if (!t.done) {
      li.draggable = true;
      li.addEventListener("dragstart", e => {
        draggingId = t.id; li.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", t.id);
      });
      li.addEventListener("dragend", () => {
        draggingId = null; li.classList.remove("dragging");
        document.querySelectorAll(".over").forEach(x => x.classList.remove("over"));
      });
      li.addEventListener("dragover", e => {
        if (draggingId && draggingId !== t.id) { e.preventDefault(); li.classList.add("over"); }
      });
      li.addEventListener("dragleave", () => li.classList.remove("over"));
      li.addEventListener("drop", e => {
        e.preventDefault(); li.classList.remove("over");
        reorder(draggingId || e.dataTransfer.getData("text/plain"), t.id);
      });
    }
    return li;
  }

  function render() {
    const pending = data.tasks.filter(t => !t.done);
    const completed = data.tasks.filter(t => t.done);
    const shown = tab === "pending" ? pending : completed;
    $("#pending-count").textContent = pending.length;
    $("#completed-count").textContent = completed.length;
    $("#heading").textContent = tab === "pending" ? "Suas tarefas" : "Tarefas concluídas";
    $("#hint").textContent = tab === "pending" ? "Arraste para mudar a ordem ou use as setas." : "Tarefas concluídas durante o dia.";
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("selected", b.dataset.tab === tab));
    $("#tasks").replaceChildren(...shown.map(renderTask));
    $("#empty").hidden = shown.length > 0;
    $("#clear").hidden = completed.length === 0;
  }

  $("#form").addEventListener("submit", e => {
    e.preventDefault();
    const title = $("#title").value.trim();
    if (!title) return;
    data.tasks.push({
      id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random()),
      title, priority: $("#priority").value, done: false
    });
    $("#title").value = ""; $("#priority").value = "medium";
    save(); tab = "pending"; render(); $("#title").focus();
  });

  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => {
    tab = b.dataset.tab; render();
  }));

  $("#clear").addEventListener("click", () => {
    if (!confirm("Excluir todas as tarefas concluídas?")) return;
    data.tasks = data.tasks.filter(t => !t.done); save(); render();
  });

  $("#today").textContent = new Intl.DateTimeFormat("pt-BR", {
    weekday:"long", day:"numeric", month:"long"
  }).format(new Date());

  save(); render();
})();
