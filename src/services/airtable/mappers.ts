import type { Property } from '../../types';

/**
 * Maps an Airtable record to a Property object.
 * @param record - The Airtable record to map.
 * @returns A structured Property object.
 */
export const mapRecordToProperty = (record: any): Property => {
  try {
    console.log(`Mapping record ${record.id} to Property`);
    return {
      id: record.id,
      name: record.get('Name') || '',
      address: record.get('Address') || '',
      accessCodes: {
        wifi: {
          name: record.get('WiFi Name') || '',
          password: record.get('WiFi Password') || '',
        },
        door: record.get('Door Code') || '',
      },
      houseRules: Array.isArray(record.get('House Rules')) 
        ? record.get('House Rules') 
        : (record.get('House Rules') || '').split('\n'),
      amenities: Array.isArray(record.get('Amenities')) 
        ? record.get('Amenities') 
        : (record.get('Amenities') || '').split('\n'),
      checkInTime: record.get('Check-in Time') || '',
      checkOutTime: record.get('Check-out Time') || '',
      maxGuests: Number(record.get('Max Guests')) || 0,
      photos: Array.isArray(record.get('Photos')) 
        ? record.get('Photos') 
        : [],
      description: record.get('Description') || '',
      parkingInfo: record.get('Parking Info') || '',
      restaurants: Array.isArray(record.get('Restaurants')) 
        ? record.get('Restaurants') 
        : (record.get('Restaurants') || '').split('\n'),
      fastFood: Array.isArray(record.get('Fast Food')) 
        ? record.get('Fast Food') 
        : (record.get('Fast Food') || '').split('\n'),
      emergencyContacts: Array.isArray(record.get('Emergency Contacts')) 
        ? record.get('Emergency Contacts') 
        : (record.get('Emergency Contacts') || '').split('\n'),
    };
  } catch (error) {
    console.error(`Error mapping record ${record.id} to Property:`, error);
    throw new Error('Failed to map Airtable record to Property');
  }
};

/**
 * Maps an Airtable record to a Conversation object.
 * @param record - The Airtable record to map.
 * @param propertyId - The ID of the associated property.
 * @returns A structured Conversation object.
 */
export const mapRecordToConversation = (record: any, propertyId: string) => {
  try {
    console.log(`Mapping record ${record.id} to Conversation`);
    return {
      id: record.id,
      propertyId,
      guestName: record.get('Guest Name') || '',
      guestEmail: record.get('Guest Email') || '',
      checkIn: record.get('Check-in Date') || '',
      checkOut: record.get('Check-out Date') || '',
      messages: (() => {
        const rawMessages = record.get('Messages');
        console.log(`Raw Messages for record ${record.id}:`, rawMessages);
        try {
          return typeof rawMessages === 'string'
            ? JSON.parse(rawMessages)
            : rawMessages || [];
        } catch (error) {
          console.warn(`Invalid Messages format for record ${record.id}:`, rawMessages, error);
          return []; // Return an empty array if the format is invalid
        }
      })(),
      status: record.get('Status') || 'Active',
    };
  } catch (error) {
    console.error(`Error mapping record ${record.id} to Conversation:`, error);
    throw new Error('Failed to map Airtable record to Conversation');
  }
};
