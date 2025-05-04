import { faker } from '@faker-js/faker';
import config from '../../config/index.js'; // Import config

/**
 * Generates a specified number of fake contact objects.
 * @param {number} count - Number of contacts to generate.
 * @returns {object[]}
 */
function generateFakeContacts(count) {
  const contacts = [];
  const emails = new Set(); // To ensure email uniqueness

  while (contacts.length < count) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Ensure email is unique before adding
    if (!emails.has(email)) {
      emails.add(email);
      contacts.push({
        name: `${firstName} ${lastName}`,
        email: email,
        // Generate phone number in a common format, or make it sometimes null
        phone: faker.datatype.boolean(0.8) ? faker.phone.number('###-###-####') : null,
        // Timestamps will be handled by the database default or Knex insert
      });
    }
  }
  return contacts;
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
  // Deletes ALL existing entries
  await knex('contacts').del();
  console.log('Previous contacts deleted.');

  // Get count from config
  const contactCount = config.seed.contactCount;
  console.log(`Attempting to generate ${contactCount} fake contacts...`);

  // Generate fake contacts
  const fakeContacts = generateFakeContacts(contactCount);
  console.log(`Successfully generated ${fakeContacts.length} unique fake contacts.`);

  // Inserts seed entries
  await knex('contacts').insert(fakeContacts);
  console.log('Fake contacts inserted successfully.');
}; 