import { PersonService } from './person-service.js';

const sheet = new CSSStyleSheet();
await sheet.replace(
  await fetch('/src/person-table.css').then(r => r.text())
);

class PersonTable extends HTMLElement {
  constructor(service = new PersonService()) {
    super();
    this.personService = service;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.adoptedStyleSheets = [sheet];

    this.currentData = [];
    this.editingId = null;

    this.darkMode =
      localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  connectedCallback() {
    this.toggleTheme(this.darkMode);
    this.load();
    this.bindEvents();
  }

  toggleTheme(force) {
    this.darkMode = force ?? !this.darkMode;
    this.toggleAttribute('dark', this.darkMode);
    localStorage.setItem('darkMode', this.darkMode);
  }

  async load() {
    this.currentData = await this.personService.getPersons();
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <div class="toolbar">
        <button class="primary" data-action="open-modal">➕ Add Person</button>
        <button class="toggle" data-action="toggle-theme">
          ${this.darkMode ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>First</th><th>Last</th><th>Age</th><th>Email</th><th></th>
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
                      <button class="primary" data-action="save-edit" data-id="${p.id}">💾</button>
                      <button class="toggle" data-action="cancel-edit">✖</button>
                    </td>`
                  : `
                    <td>${p.firstName}</td>
                    <td>${p.lastName}</td>
                    <td>${p.age}</td>
                    <td>${p.email}</td>
                    <td>
                      <button class="primary" data-action="edit" data-id="${p.id}">✏️</button>
                      <button class="danger" data-action="delete" data-id="${p.id}">🗑</button>
                    </td>`
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
          <div style="text-align:right;">
            <button class="toggle" data-action="cancel-modal">Cancel</button>
            <button class="primary" data-action="save-new">Save</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    this.shadowRoot.addEventListener('click', e => {
      const btn = e.target.closest('button');
      if (!btn) return;

      const action = btn.dataset.action;
      const id = Number(btn.dataset.id);

      switch (action) {
        case 'open-modal':
          this.openModal();
          break;
        case 'toggle-theme':
          this.toggleTheme();
          break;
        case 'edit':
          this.editingId = id;
          this.render();
          break;
        case 'cancel-edit':
          this.editingId = null;
          this.render();
          break;
        case 'save-edit':
          this.saveEdit(id);
          break;
        case 'delete':
          this.deletePerson(id);
          break;
        case 'save-new':
          this.addPersonFromForm();
          break;
        case 'cancel-modal':
          this.closeModal();
          break;
      }
    });
  }

  openModal() {
    this.shadowRoot.querySelector('.modal').classList.add('open');
  }

  closeModal() {
    this.shadowRoot.querySelector('.modal').classList.remove('open');
  }

  async saveEdit(id) {
    const row = this.shadowRoot.querySelector(`tr[data-id="${id}"]`);
    await this.personService.updatePerson({
      id,
      firstName: row.querySelector('.edit-first').value,
      lastName: row.querySelector('.edit-last').value,
      age: Number(row.querySelector('.edit-age').value),
      email: row.querySelector('.edit-email').value
    });
    this.editingId = null;
    this.load();
  }

  async addPersonFromForm() {
    const root = this.shadowRoot;
    await this.personService.addPerson({
      id: Date.now(),
      firstName: root.querySelector('#firstName').value,
      lastName: root.querySelector('#lastName').value,
      age: Number(root.querySelector('#age').value),
      email: root.querySelector('#email').value
    });
    this.closeModal();
    this.load();
  }
}

customElements.define('person-table', PersonTable);
