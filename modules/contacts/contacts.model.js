import { getDatabaseInstance } from '../../bootstrap/database.js';

const TABLE_NAME = 'contacts';
const db = () => getDatabaseInstance();

// Helper to map database row to a plain contact object (optional, but good practice)
// Can be expanded to handle transformations if DB columns differ from desired object keys
const mapRowToContact = (row) => {
    if (!row) return undefined;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        created_at: row.created_at,
        updated_at: row.updated_at
    };
};

/**
 * Finds all contacts.
 * @param {object} params - Optional parameters for filtering/pagination (not implemented yet).
 * @returns {Promise<object[]>}
 */
export const findAll = async (params = {}) => {
    // Add query building logic here based on params if needed
    const results = await db()(TABLE_NAME).select('*');
    return results.map(mapRowToContact);
};

/**
 * Finds a single contact by ID.
 * @param {number} id
 * @returns {Promise<object | undefined>}
 */
export const findById = async (id) => {
    const row = await db()(TABLE_NAME).where({ id }).first();
    return mapRowToContact(row);
};

/**
 * Creates a new contact.
 * @param {object} contactData - Data for the new contact (e.g., { name, email, phone }).
 * @returns {Promise<object>}
 */
export const create = async (contactData) => {
    if (!contactData.name || !contactData.email) {
        // Validation should ideally be handled in the service or controller with schemas
        throw new Error('Name and email are required');
    }
    const [newRow] = await db()(TABLE_NAME).insert(contactData).returning('*');
    return mapRowToContact(newRow);
};

/**
 * Updates an existing contact.
 * @param {number} id
 * @param {object} contactData - Data to update.
 * @returns {Promise<object | undefined>}
 */
export const update = async (id, contactData) => {
    const [updatedRow] = await db()(TABLE_NAME)
        .where({ id })
        .update({
            ...contactData,
            updated_at: new Date() // Manually update timestamp
        })
        .returning('*');
    return mapRowToContact(updatedRow);
};

/**
 * Deletes a contact by ID.
 * @param {number} id
 * @returns {Promise<boolean>} - True if a contact was deleted, false otherwise.
 */
export const remove = async (id) => { // Renamed from delete to avoid keyword clash
    const deletedCount = await db()(TABLE_NAME).where({ id }).del();
    return deletedCount > 0;
};
