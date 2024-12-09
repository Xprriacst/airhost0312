import { base } from './config';
import { handleServiceError } from '../../utils/error';
import type { AIInstruction } from '../../types';

export const aiInstructionService = {
  async getInstructionsForProperty(propertyId: string): Promise<AIInstruction[]> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const records = await base('AI Configuration')
        .select({
          filterByFormula: `{Property} = '${propertyId}'`,
          sort: [{ field: 'Priority', direction: 'asc' }]
        })
        .all();

      return records.map(record => ({
        id: record.id,
        propertyId,
        type: record.get('Type') as AIInstruction['type'],
        content: record.get('Content') as string,
        isActive: record.get('Active') as boolean,
        priority: record.get('Priority') as number
      }));
    } catch (error) {
      return handleServiceError(error, 'AIInstruction.getInstructionsForProperty');
    }
  },

  async createInstruction(instruction: Omit<AIInstruction, 'id'>): Promise<AIInstruction> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const record = await base('AI Configuration').create({
        Property: [instruction.propertyId],
        Type: instruction.type,
        Content: instruction.content,
        Priority: instruction.priority,
        Active: instruction.isActive
      });

      return {
        id: record.id,
        propertyId: instruction.propertyId,
        type: record.get('Type') as AIInstruction['type'],
        content: record.get('Content') as string,
        isActive: record.get('Active') as boolean,
        priority: record.get('Priority') as number
      };
    } catch (error) {
      return handleServiceError(error, 'AIInstruction.createInstruction');
    }
  },

  async updateInstruction(id: string, data: Partial<AIInstruction>): Promise<AIInstruction> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const record = await base('AI Configuration').update(id, {
        Type: data.type,
        Content: data.content,
        Priority: data.priority,
        Active: data.isActive
      });

      return {
        id: record.id,
        propertyId: data.propertyId!,
        type: record.get('Type') as AIInstruction['type'],
        content: record.get('Content') as string,
        isActive: record.get('Active') as boolean,
        priority: record.get('Priority') as number
      };
    } catch (error) {
      return handleServiceError(error, 'AIInstruction.updateInstruction');
    }
  },

  async deleteInstruction(id: string): Promise<void> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      await base('AI Configuration').destroy(id);
    } catch (error) {
      return handleServiceError(error, 'AIInstruction.deleteInstruction');
    }
  }
};
