import { base } from './config';
import { mockProperties } from './mockData';
import { mapRecordToProperty } from './mappers';
import { handleServiceError } from '../../utils/error';
import { aiInstructionService } from './aiInstructionService';
import { faqService } from './faqService';
import type { Property } from '../../types';

export const propertyService = {
  async getProperties(): Promise<Property[]> {
    try {
      console.log("Fetching properties from Airtable...");
      if (!base) {
        console.warn('Airtable is not configured. Using mock data.');
        return mockProperties;
      }

      const records = await base('Properties')
        .select({ view: 'Grid view' })
        .all();

      console.log("Raw Airtable records:", records);

      const properties = await Promise.all(
        records.map(async (record) => {
          const property = mapRecordToProperty(record);
          console.log("Mapped property:", property);
          const [aiInstructions, faq] = await Promise.all([
            aiInstructionService.getInstructionsForProperty(property.id),
            faqService.getFAQsForProperty(property.id)
          ]);
          return {
            ...property,
            aiInstructions,
            faq
          };
        })
      );

      console.log("Final properties list:", properties);
      return properties;
    } catch (error) {
      console.error('Error fetching properties:', error);
      return handleServiceError(error, 'Property.getProperties');
    }
  },

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const record = await base('Properties').find(id);
      const property = mapRecordToProperty(record);

      const [aiInstructions, faq] = await Promise.all([
        aiInstructionService.getInstructionsForProperty(id),
        faqService.getFAQsForProperty(id)
      ]);

      return {
        ...property,
        aiInstructions,
        faq
      };
    } catch (error) {
      return handleServiceError(error, 'Property.getPropertyById');
    }
  },

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property | null> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      // Update main property record
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
        'Emergency Contacts': propertyData.emergencyContacts,
        'Auto Pilot': propertyData.autoPilot
      });

      console.log("Updated property record:", updatedRecord);

      // Update AI Instructions
      if (propertyData.aiInstructions) {
        await Promise.all(
          propertyData.aiInstructions.map((instruction) =>
            instruction.id
              ? aiInstructionService.updateInstruction(instruction.id, instruction)
              : aiInstructionService.createInstruction(instruction)
          )
        );
      }

      // Update FAQs
      if (propertyData.faq) {
        await Promise.all(
          propertyData.faq.map((faq) =>
            faq.id
              ? faqService.updateFAQ(faq.id, faq)
              : faqService.createFAQ(faq)
          )
        );
      }

      return this.getPropertyById(id);
    } catch (error) {
      return handleServiceError(error, 'Property.updateProperty');
    }
  },

  async toggleAutoPilot(id: string, autoPilot: boolean): Promise<Property | null> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const updatedRecord = await base('Properties').update(id, {
        'Auto Pilot': autoPilot
      });

      console.log("Toggled Auto Pilot for property:", updatedRecord);

      return mapRecordToProperty(updatedRecord);
    } catch (error) {
      return handleServiceError(error, 'Property.toggleAutoPilot');
    }
  }
};
