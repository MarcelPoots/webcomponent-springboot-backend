import { PersonService } from './person-service.js';

class PersonTable extends HTMLElement {
  constructor(service = new PersonService()) {
    super();
    this.personService = service;
    this.attachShadow({ mode: 'open' });
    this.darkMode = false;
  }

  connectedCallback() {
    this.load();
  }

  async load() {
    const data = await this.personService.getPersons();
    this.render(data);
  }

  async addPerson() {
    const id = prompt('Unique ID for the person');
    const firstName = prompt('First Name');
    const lastName = prompt('Last Name');
    const age = prompt('Age');
    const email = prompt('Email');

    if (!firstName || !lastName) return;

    await this.personService.addPerson({ id,firstName, lastName, age, email });
    this.load();
  }

  async deletePerson(id) {
    if (!confirm('Delete this person?')) return;
    await this.personService.deletePerson(id);
    this.load();
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    this.render(this.currentData);
  }

  render(data) {
    this.currentData = data;

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
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          transition: background 0.3s ease, color 0.3s ease;
        }

        .toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        button {
          border: none;
          padding: 0.5rem 0.9rem;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: 0.2s ease;
        }

        .add {
          background: #4f46e5;
          color: white;
        }

        .add:hover {
          background: #4338ca;
        }

        .toggle {
          background: transparent;
          color: inherit;
          border: 1px solid currentColor;
        }

        .delete {
          background: #ef4444;
          color: white;
        }

        .delete:hover {
          background: #dc2626;
        }

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

        tr:hover td {
          background: ${this.darkMode ? '#2f2f2f' : '#f1f5f9'};
        }
      </style>

      <div class="toolbar">
        <button class="add">➕ Add Person</button>
        <button class="toggle">${this.darkMode ? '☀ Light' : '🌙 Dark'}</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First</th>
            <th>Last</th>
            <th>Age</th>
            <th>Email</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${data.map(p => `
            <tr>
              <td>${p.id}</td>
              <td>${p.firstName}</td>
              <td>${p.lastName}</td>
              <td>${p.age}</td>
              <td>${p.email}</td>
              <td>
                <button class="delete" data-id="${p.id}">🗑</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    this.shadowRoot.querySelector('.add').onclick = () => this.addPerson();
    this.shadowRoot.querySelector('.toggle').onclick = () => this.toggleTheme();

    this.shadowRoot.querySelectorAll('.delete').forEach(btn =>
      btn.onclick = () => this.deletePerson(btn.dataset.id)
    );
  }
}

customElements.define('person-table', PersonTable);
