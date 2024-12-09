import { base } from './config';
import { handleServiceError } from '../../utils/error';
import type { FAQItem } from '../../types';

export const faqService = {
  async getFAQsForProperty(propertyId: string): Promise<FAQItem[]> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const records = await base('FAQ')
        .select({
          filterByFormula: `{Property} = '${propertyId}'`,
          sort: [{ field: 'UseCount', direction: 'desc' }]
        })
        .all();

      return records.map(record => ({
        id: record.id,
        propertyId,
        question: record.get('Question') as string,
        answer: record.get('Answer') as string,
        category: record.get('Category') as FAQItem['category'],
        isActive: record.get('Active') as boolean,
        useCount: record.get('UseCount') as number || 0
      }));
    } catch (error) {
      return handleServiceError(error, 'FAQ.getFAQsForProperty');
    }
  },

  async createFAQ(faq: Omit<FAQItem, 'id'>): Promise<FAQItem> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const record = await base('FAQ').create({
        Property: [faq.propertyId],
        Question: faq.question,
        Answer: faq.answer,
        Category: faq.category,
        Active: faq.isActive,
        UseCount: faq.useCount || 0
      });

      return {
        id: record.id,
        propertyId: faq.propertyId,
        question: record.get('Question') as string,
        answer: record.get('Answer') as string,
        category: record.get('Category') as FAQItem['category'],
        isActive: record.get('Active') as boolean,
        useCount: record.get('UseCount') as number || 0
      };
    } catch (error) {
      return handleServiceError(error, 'FAQ.createFAQ');
    }
  },

  async updateFAQ(id: string, data: Partial<FAQItem>): Promise<FAQItem> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const record = await base('FAQ').update(id, {
        Question: data.question,
        Answer: data.answer,
        Category: data.category,
        Active: data.isActive,
        UseCount: data.useCount
      });

      return {
        id: record.id,
        propertyId: data.propertyId!,
        question: record.get('Question') as string,
        answer: record.get('Answer') as string,
        category: record.get('Category') as FAQItem['category'],
        isActive: record.get('Active') as boolean,
        useCount: record.get('UseCount') as number || 0
      };
    } catch (error) {
      return handleServiceError(error, 'FAQ.updateFAQ');
    }
  },

  async incrementUseCount(id: string): Promise<void> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      const record = await base('FAQ').find(id);
      const currentCount = record.get('UseCount') as number || 0;

      await base('FAQ').update(id, {
        UseCount: currentCount + 1
      });
    } catch (error) {
      return handleServiceError(error, 'FAQ.incrementUseCount');
    }
  },

  async deleteFAQ(id: string): Promise<void> {
    try {
      if (!base) {
        throw new Error('Airtable is not configured');
      }

      await base('FAQ').destroy(id);
    } catch (error) {
      return handleServiceError(error, 'FAQ.deleteFAQ');
    }
  }
};
