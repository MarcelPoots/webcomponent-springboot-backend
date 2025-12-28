import { PersonService } from './person-service.js';

class PersonTable extends HTMLElement {
  constructor() {
    super();
    this.personService = new PersonService();
  }

  connectedCallback() {
    console.log('PersonTable connected');
    this.load();
  }

  async load() {
    try {
      const data = await this.personService.getPersons();
      this.render(data);
    } catch (err) {
      console.error(err);
    }
  }

  async addPerson() {
    const firstName = prompt('First Name');
    const lastName = prompt('Last Name');
    const age = prompt('Age');
    const email = prompt('Email');

    if (!firstName || !lastName) return;

    await this.personService.addPerson({
      firstName,
      lastName,
      age,
      email
    });

    this.load();
  }

  render(data) {
    this.innerHTML = `
      <button id="add">Add Person</button>
      <table border="1" cellpadding="5">
        <tr><th>First</th><th>Last</th><th>Age</th><th>Email</th></tr>
        ${data.map(p => `
          <tr>
            <td>${p.firstName}</td>
            <td>${p.lastName}</td>
            <td>${p.age}</td>
            <td>${p.email}</td>
          </tr>`).join('')}
      </table>
    `;

    this.querySelector('#add').onclick = () => this.addPerson();
  }
}

customElements.define('person-table', PersonTable);
