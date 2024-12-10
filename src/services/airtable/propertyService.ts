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
      console.log("[propertyService] Fetching properties from Airtable...");
      if (!base) {
        console.warn('[propertyService] Airtable is not configured. Using mock data.');
        console.log("[propertyService] Mock Properties:", mockProperties);
        return mockProperties;
      }

      const records = await base('Properties')
        .select({ view: 'Grid view' })
        .all();

      console.log("[propertyService] Raw Airtable records:", records);

      const properties = await Promise.all(
        records.map(async (record) => {
          console.log("[propertyService] Processing record:", record);
          const property = mapRecordToProperty(record);
          console.log("[propertyService] Mapped property:", property);

          const [aiInstructions, faq] = await Promise.all([
            aiInstructionService.getInstructionsForProperty(property.id),
            faqService.getFAQsForProperty(property.id)
          ]);
          console.log("[propertyService] AI Instructions:", aiInstructions);
          console.log("[propertyService] FAQs:", faq);

          return {
            ...property,
            aiInstructions,
            faq
          };
        })
      );

      console.log("[propertyService] Final properties list:", properties);
      return properties;
    } catch (error) {
      console.error('[propertyService] Error fetching properties:', error);
      return handleServiceError(error, 'Property.getProperties');
    }
  },

  async getPropertyById(id: string): Promise<Property | null> {
    try {
      console.log(`[propertyService] Fetching property by ID: ${id}`);
      if (!base) {
        throw new Error('[propertyService] Airtable is not configured');
      }

      const record = await base('Properties').find(id);
      console.log("[propertyService] Raw record:", record);
      const property = mapRecordToProperty(record);

      const [aiInstructions, faq] = await Promise.all([
        aiInstructionService.getInstructionsForProperty(id),
        faqService.getFAQsForProperty(id)
      ]);

      console.log("[propertyService] AI Instructions:", aiInstructions);
      console.log("[propertyService] FAQs:", faq);

      return {
        ...property,
        aiInstructions,
        faq
      };
    } catch (error) {
      console.error(`[propertyService] Error fetching property by ID: ${id}`, error);
      return handleServiceError(error, 'Property.getPropertyById');
    }
  },

  async updateProperty(id: string, propertyData: Partial<Property>): Promise<Property | null> {
    try {
      console.log(`[propertyService] Updating property with ID: ${id}`, propertyData);
      if (!base) {
        throw new Error('[propertyService] Airtable is not configured');
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
        'Emergency Contacts': propertyData.emergencyContacts,
        'Auto Pilot': propertyData.autoPilot
      });

      console.log("[propertyService] Updated property record:", updatedRecord);

      if (propertyData.aiInstructions) {
        console.log("[propertyService] Updating AI Instructions:", propertyData.aiInstructions);
        await Promise.all(
          propertyData.aiInstructions.map((instruction) =>
            instruction.id
              ? aiInstructionService.updateInstruction(instruction.id, instruction)
              : aiInstructionService.createInstruction(instruction)
          )
        );
      }

      if (propertyData.faq) {
        console.log("[propertyService] Updating FAQs:", propertyData.faq);
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
      console.error(`[propertyService] Error updating property with ID: ${id}`, error);
      return handleServiceError(error, 'Property.updateProperty');
    }
  },

  async toggleAutoPilot(id: string, autoPilot: boolean): Promise<Property | null> {
    try {
      console.log(`[propertyService] Toggling Auto Pilot for property ID: ${id} to ${autoPilot}`);
      if (!base) {
        throw new Error('[propertyService] Airtable is not configured');
      }

      const updatedRecord = await base('Properties').update(id, {
        'Auto Pilot': autoPilot
      });

      console.log("[propertyService] Toggled Auto Pilot for property:", updatedRecord);

      return mapRecordToProperty(updatedRecord);
    } catch (error) {
      console.error(`[propertyService] Error toggling Auto Pilot for property ID: ${id}`, error);
      return handleServiceError(error, 'Property.toggleAutoPilot');
    }
  }
};
