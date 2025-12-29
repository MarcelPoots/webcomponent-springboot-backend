import { PersonService } from './person-service.js';

class PersonTable extends HTMLElement {
  constructor(service = new PersonService()) {
    super();
    this.personService = service;
    this.attachShadow({ mode: 'open' });
    this.editingId = null

    this.darkMode =
      localStorage.getItem('darkMode') !== null
        ? localStorage.getItem('darkMode') === 'true'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;


    this.currentData = [];
  }

  connectedCallback() {
    this.load();
  }

  async load() {
    const data = await this.personService.getPersons();
    this.currentData = data;
    this.render();
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', this.darkMode);
    this.render();
  }
  startEdit(id) {
    this.editingId = id;
    this.render();
  }

  cancelEdit() {
    this.editingId = null;
    this.render();
  }

  async saveEdit(id) {
    const row = this.shadowRoot.querySelector(`tr[data-id="${id}"]`);

    const updated = {
      id,
      firstName: row.querySelector('.edit-first').value,
      lastName: row.querySelector('.edit-last').value,
      age: Number(row.querySelector('.edit-age').value),
      email: row.querySelector('.edit-email').value
    };

    await this.personService.updatePerson(updated);
    this.editingId = null;
    this.load();
  }

  async addPersonFromForm() {
    const firstName = this.shadowRoot.querySelector('#firstName').value.trim();
    const lastName = this.shadowRoot.querySelector('#lastName').value.trim();
    const age = Number(this.shadowRoot.querySelector('#age').value);
    const email = this.shadowRoot.querySelector('#email').value.trim();

    if (!firstName || !lastName) {
      alert('First and last name are required');
      return;
    }

    const id = this.currentData.length + 1;

    await this.personService.addPerson({
      id,
      firstName,
      lastName,
      age,
      email
    });

    this.closeModal();
    this.load();
  }

  async deletePerson(id) {
    if (!confirm('Delete this person?')) return;
    await this.personService.deletePerson(id);
    this.load();
  }

  openModal() {
    this.shadowRoot.querySelector('.modal').classList.add('open');
  }

  closeModal() {
    this.shadowRoot.querySelector('.modal').classList.remove('open');
  }




  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: system-ui, sans-serif;
          display: block;
          max-width: 900px;
          margin: 2rem auto;
          background: ${this.darkMode ? '#1e1e1e' : '#ffffff'};
          color: ${this.darkMode ? '#e5e5e5' : '#1f2937'};
          border-radius: 12px;
          padding: 1.5rem;
          transition: background 0.3s, color 0.3s;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
        }

        button {
          padding: 0.5rem 0.9rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }

        .primary { background: #4f46e5; color: white; }
        .danger { background: #ef4444; color: white; }
        .toggle { background: transparent; border: 1px solid currentColor; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        th, td {
          padding: 0.75rem;
          text-align: left;
        }

        th {
          background: ${this.darkMode ? '#2a2a2a' : '#f3f4f6'};
        }

        tr:nth-child(even) td {
          background: ${this.darkMode ? '#242424' : '#fafafa'};
        }

        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: none;
          align-items: center;
          justify-content: center;
        }

        .modal.open {
          display: flex;
        }

        .modal-content {
          background: ${this.darkMode ? '#1f1f1f' : '#ffffff'};
          padding: 1.5rem;
          border-radius: 10px;
          width: 320px;
        }

        .modal-content input {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.75rem;
        }
      </style>

      <div class="toolbar">
        <button class="primary" id="addBtn">➕ Add Person</button>
        <button class="toggle" id="toggleTheme">
          ${this.darkMode ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>First</th>
            <th>Last</th>
            <th>Age</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
  ${this.currentData.map(p => `
    <tr data-id="${p.id}">
      ${
        this.editingId === p.id
          ? `
            <td><input class="edit-first" value="${p.firstName}"></td>
            <td><input class="edit-last" value="${p.lastName}"></td>
            <td><input class="edit-age" type="number" value="${p.age}"></td>
            <td><input class="edit-email" value="${p.email}"></td>
            <td>
              <button class="primary save" data-id="${p.id}">💾</button>
              <button class="toggle cancel" data-id="${p.id}">✖</button>
            </td>
          `
          : `
            <td>${p.firstName}</td>
            <td>${p.lastName}</td>
            <td>${p.age}</td>
            <td>${p.email}</td>
            <td>
              <button class="primary edit" data-id="${p.id}">✏️</button>
              <button class="danger delete" data-id="${p.id}">🗑</button>
            </td>
          `
      }
    </tr>
  `).join('')}
</tbody>

      </table>

      <div class="modal">
        <div class="modal-content">
          <h3>Add Person</h3>
          <input id="firstName" placeholder="First name">
          <input id="lastName" placeholder="Last name">
          <input id="age" type="number" placeholder="Age">
          <input id="email" placeholder="Email">
          <div style="margin-top: 1rem; text-align: right;">
            <button class="toggle" id="cancel">Cancel</button>
            <button class="primary" id="save">Save</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#addBtn').onclick = () => this.openModal();
    this.shadowRoot.querySelector('#toggleTheme').onclick = () => this.toggleTheme();
    this.shadowRoot.querySelector('#cancel').onclick = () => this.closeModal();
    this.shadowRoot.querySelector('#save').onclick = () => this.addPersonFromForm();

    this.shadowRoot.querySelectorAll('.danger').forEach(btn =>
      btn.onclick = () => this.deletePerson(btn.dataset.id)
    );

this.shadowRoot.querySelectorAll('.edit').forEach(btn =>
  btn.onclick = () => this.startEdit(Number(btn.dataset.id))
);

this.shadowRoot.querySelectorAll('.save').forEach(btn =>
  btn.onclick = () => this.saveEdit(Number(btn.dataset.id))
);

this.shadowRoot.querySelectorAll('.cancel').forEach(btn =>
  btn.onclick = () => this.cancelEdit()
);

this.shadowRoot.querySelectorAll('.delete').forEach(btn =>
  btn.onclick = () => this.deletePerson(btn.dataset.id)
);


  }
}

customElements.define('person-table', PersonTable);
