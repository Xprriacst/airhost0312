import { base } from './config';
import { mockProperties } from './mockData';
import { mapRecordToProperty } from './mappers';
import { handleServiceError } from '../../utils/error';
import type { Property } from '../../types';

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      if (!base) {
        console.warn('Airtable is not configured. Using mock data.');
        return mockProperties;
      }

      const records = await base('Properties')
        .select({ view: 'Grid view' })
        .all();
      return records.map(mapRecordToProperty);
    } catch (error) {
      return handleServiceError(error, 'Property.getProperties');
    }
  },

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property | null> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const updatedRecord = await base('Properties').update(id, {
        Name: propertyData.name,
        Address: propertyData.address,
        'WiFi Name': propertyData.accessCodes?.wifi?.name,
        'WiFi Password': propertyData.accessCodes?.wifi?.password,
        'Door Code': propertyData.accessCodes?.door,
        'House Rules': propertyData.houseRules,
        'Amenities': propertyData.amenities,
        'Check-in Time': propertyData.checkInTime,
        'Check-out Time': propertyData.checkOutTime,
        'Max Guests': propertyData.maxGuests,
        'Description': propertyData.description,
        'Parking Info': propertyData.parkingInfo,
        'Restaurants': propertyData.restaurants,
        'Fast Food': propertyData.fastFood,
        'Emergency Contacts': propertyData.emergencyContacts
      });

      return mapRecordToProperty(updatedRecord);
    } catch (error) {
      return handleServiceError(error, 'Property.updateProperty');
    }
  },

  async addProperty(propertyData: Record<string, any>): Promise<Property | null> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const createdRecord = await base('Properties').create(propertyData);
      return mapRecordToProperty(createdRecord);
    } catch (error) {
      return handleServiceError(error, 'Property.addProperty');
    }
  },

  async deleteProperty(id: string): Promise<{ success: boolean }> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      await base('Properties').destroy(id);
      return { success: true };
    } catch (error) {
      return handleServiceError(error, 'Property.deleteProperty');
    }
  }
};