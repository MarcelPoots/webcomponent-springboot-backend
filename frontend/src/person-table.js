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

  async addPersonFromForm() {
    const firstName = this.shadowRoot.querySelector('#firstName').value.trim();
    const lastName = this.shadowRoot.querySelector('#lastName').value.trim();
    const age = this.shadowRoot.querySelector('#age').value;
    const email = this.shadowRoot.querySelector('#email').value;

    if (!firstName || !lastName) return alert('First and last name required');

    // Generate ID = number of persons + 1
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

  openModal() {
    this.shadowRoot.querySelector('.modal').classList.add('open');
  }

  closeModal() {
    this.shadowRoot.querySelector('.modal').classList.remove('open');
  }

  async deletePerson(id) {
    if (!confirm('Delete this person?')) return;
    await this.personService.deletePerson(id);
    this.load();
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
        }

        button {
          padding: 0.5rem 0.9rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }

        .primary { background: #4f46e5; color: white; }
        .danger { background: #ef4444; color: white; }
        .ghost { background: transparent; border: 1px solid #ccc; }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
        }

        th, td {
          padding: 0.7rem;
          text-align: left;
        }

        th {
          background: #f3f4f6;
        }

        tr:nth-child(even) td {
          background: #fafafa;
        }

        /* Modal */
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
          background: white;
          padding: 1.5rem;
          border-radius: 10px;
          width: 320px;
        }

        .modal-content h3 {
          margin-top: 0;
        }

        .modal-content input {
          width: 100%;
          padding: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }
      </style>

      <button class="primary" id="addBtn">➕ Add Person</button>

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
          ${data.map(p => `
            <tr>
              <td>${p.firstName}</td>
              <td>${p.lastName}</td>
              <td>${p.age}</td>
              <td>${p.email}</td>
              <td>
                <button class="danger" data-id="${p.id}">🗑</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="modal">
        <div class="modal-content">
          <h3>Add Person</h3>
          <input id="firstName" placeholder="First name" />
          <input id="lastName" placeholder="Last name" />
          <input id="age" placeholder="Age" type="number" />
          <input id="email" placeholder="Email" />
          <div class="actions">
            <button class="ghost" id="cancel">Cancel</button>
            <button class="primary" id="save">Save</button>
          </div>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('#addBtn').onclick = () => this.openModal();
    this.shadowRoot.querySelector('#cancel').onclick = () => this.closeModal();
    this.shadowRoot.querySelector('#save').onclick = () => this.addPersonFromForm();

    this.shadowRoot.querySelectorAll('.danger').forEach(btn =>
      btn.onclick = () => this.deletePerson(btn.dataset.id)
    );
  }
}

customElements.define('person-table', PersonTable);
