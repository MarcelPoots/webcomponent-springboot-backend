class PersonTable extends HTMLElement {
    connectedCallback() {
      console.log('PersonTable connected');  
      this.load();
    }
  
    async load() {
      const res = await fetch('http://localhost:8080/persons');
      const data = await res.json();
      this.render(data);
    }
  
    async addPerson() {
      const firstName = prompt('First Name');
      const lastName = prompt('Last Name');
      const age = prompt('Age');
      const email = prompt('Email');
      if (!firstName || !lastName) return;
  
      await fetch('http://localhost:8080/add-person', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ firstName, lastName, age, email })
      });
  
      this.load();
    }
  
    render(data) {
      this.innerHTML = `
        <button id="add">Add Person</button>
        <table border="1" cellpadding="5">
          <tr><th>First</th><th>Last</th><th>Birth</th><th>Gender</th></tr>
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
  