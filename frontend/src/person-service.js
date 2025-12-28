export class PersonService {
  constructor(baseUrl = 'http://localhost:8080') {
    this.baseUrl = baseUrl;
  }

  async getPersons() {
    const res = await fetch(`${this.baseUrl}/persons`);
    if (!res.ok) throw new Error('Failed to load persons');
    return res.json();
  }

  async addPerson(person) {
    const res = await fetch(`${this.baseUrl}/add-person`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(person),
    });

    if (!res.ok) throw new Error('Failed to add person');
    return res.json();
  }
}
