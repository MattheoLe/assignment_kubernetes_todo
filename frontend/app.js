const API_URL = "/api/tasks";
const errorEl = document.getElementById("error-msg");
const listEl = document.getElementById("task-list");
const countEl = document.getElementById("task-count");

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.style.display = "block";
    setTimeout(function () {
        errorEl.style.display = "none";
    }, 5000);
}

async function loadTasks() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Erreur serveur " + res.status);
        const tasks = await res.json();
        listEl.innerHTML = "";
        if (tasks.length === 0) {
            listEl.innerHTML = '<div class="empty-state">Aucune tache pour le moment</div>';
            countEl.textContent = "";
        } else {
            tasks.forEach(function (task) {
                const li = document.createElement("li");
                li.textContent = task.title;
                listEl.appendChild(li);
            });
            countEl.textContent = tasks.length + " tache" + (tasks.length > 1 ? "s" : "");
        }
    } catch (e) {
        showError("Impossible de charger les taches. Le backend est-il accessible ?");
    }
}

document.getElementById("task-form").addEventListener("submit", async function (e) {
    e.preventDefault();
    const input = document.getElementById("task-input");
    const title = input.value.trim();
    if (!title) return;
    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: title }),
        });
        if (!res.ok) throw new Error("Erreur serveur " + res.status);
        input.value = "";
        await loadTasks();
    } catch (e) {
        showError("Impossible d'ajouter la tache. Verifiez la connexion au backend.");
    }
});

loadTasks();
