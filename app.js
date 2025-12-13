import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBKvK_lHUna6TNvBKlGDd95ks07lUTEjxg",
  authDomain: "to-do-list-866f2.firebaseapp.com",
  projectId: "to-do-list-866f2",
  storageBucket: "to-do-list-866f2.appspot.com",
  messagingSenderId: "973460689398",
  appId: "1:973460689398:web:faf1356209c1c9780877d7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let tasks = [];
let historyData = [];
let userRef = null;

const el = (id) => document.getElementById(id);

async function loadUserData() {
  userRef = doc(db, "users", currentUser.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    tasks = snap.data().tasks || [];
    historyData = snap.data().history || [];
  } else {
    await setDoc(userRef, { tasks: [], history: [] });
    tasks = [];
    historyData = [];
  }
}

async function saveData() {
  if (!userRef) return;
  await setDoc(userRef, { tasks, history: historyData }, { merge: true });
}

function renderTasks() {
  const list = el("taskList");
  if (!list) return;

  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<p style="color:#777;font-size:14px">No tasks yet</p>`;
    return;
  }

  tasks.forEach((task, i) => {
    const item = document.createElement("div");
    item.className = "task-item";

    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;

    checkbox.onchange = async () => {
      tasks[i].completed = checkbox.checked;
      await saveData();
      renderTasks();
    };

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    if (task.completed) text.classList.add("completed");

    left.appendChild(checkbox);
    left.appendChild(text);

    const right = document.createElement("div");
    right.className = "task-right";

    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn";
    editBtn.textContent = "Edit";
    editBtn.onclick = async () => {
      const newText = prompt("Edit task:", task.text);
      if (newText && newText.trim()) {
        tasks[i].text = newText.trim();
        await saveData();
        renderTasks();
      }
    };

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.textContent = "Delete";
    delBtn.onclick = async () => {
      const removed = tasks.splice(i, 1)[0];
      historyData.unshift({
        text: removed.text,
        deletedOn: new Date().toLocaleString()
      });
      await saveData();
      renderTasks();
    };

    right.appendChild(editBtn);
    right.appendChild(delBtn);

    item.appendChild(left);
    item.appendChild(right);
    list.appendChild(item);
  });
}

function renderHistory() {
  const list = el("historyList");
  if (!list) return;

  list.innerHTML = "";

  if (historyData.length === 0) {
    list.innerHTML = `<p style="color:#777;font-size:14px">No deleted tasks</p>`;
    return;
  }

  historyData.forEach(item => {
    const div = document.createElement("div");
    div.className = "task-item";
    div.innerHTML = `
      <span class="task-text">
        ${item.text} (Deleted on ${item.deletedOn})
      </span>
    `;
    list.appendChild(div);
  });
}
function wireIndex() {
  if (!el("addBtn")) return;

  el("addBtn").onclick = async () => {
    const input = el("taskInput");
    const text = input.value.trim();
    if (!text) return;

    tasks.push({ text, completed: false });
    input.value = "";
    await saveData();
    renderTasks();
  };

  el("taskInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") el("addBtn").click();
  });

  el("logoutBtn").onclick = async () => {
    await signOut(auth);
  };

  el("historyBtn").onclick = () => {
    window.location.href = "history.html";
  };
}

function wireHistory() {
  if (!el("backBtn")) return;

  el("backBtn").onclick = () => {
    window.location.href = "index.html";
  };

  el("clearHistoryBtn").onclick = async () => {
    if (!confirm("Clear all history?")) return;
    historyData = [];
    await saveData();
    renderHistory();
  };
}

const loginBtn = el("loginBtn");
if (loginBtn) {
  loginBtn.onclick = async (e) => {
    e.preventDefault();
    const email = el("email").value.trim();
    const password = el("password").value.trim();
    if (!email || !password) return alert("Please fill in both fields");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message || "Failed to sign in");
    }
  };
}

const signupBtn = el("signupBtn");
if (signupBtn) {
  signupBtn.onclick = async (e) => {
    e.preventDefault();
    const email = el("email").value.trim();
    const password = el("password").value.trim();
    const confirm = el("confirm").value.trim();

    if (!email || !password) return alert("Please fill in all fields");
    if (password !== confirm) return alert("Passwords do not match");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      alert(err.message || "Failed to sign up");
    }
  };
}

onAuthStateChanged(auth, async (user) => {
  const path = window.location.pathname.split("/").pop();

  const protectedPages = ["index.html", "history.html", ""];
  const authPages = ["login.html", "signup.html"];

  if (!user) {
    if (protectedPages.includes(path)) {
      window.location.href = "login.html";
    }
    return;
  }

  currentUser = user;
  if (el("userDisplay")) el("userDisplay").textContent = user.email;

  await loadUserData();

  wireIndex();
  wireHistory();
  renderTasks();
  renderHistory();

  if (authPages.includes(path)) {
    window.location.href = "index.html";
  }
});
