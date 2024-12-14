import { base } from './airtable/config';
import { mapRecordToProperty } from './airtable/mappers';
import type { Property } from '../types';

class PropertyService {
  async getProperties(): Promise<Property[]> {
    try {
      const records = await base('Properties')
        .select({ view: 'Grid view' })
        .all();
      return records.map(mapRecordToProperty);
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw new Error('Failed to fetch properties');
    }
  }

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      const record = await base('Properties').find(id);
      return mapRecordToProperty(record);
    } catch (error) {
      console.error('Error fetching property:', error);
      return null;
    }
  }
}

export const propertyService = new PropertyService();
