import axios from 'axios';

const WEBHOOK_URL = 'https://dynamic-kashata-78603a.netlify.app/.netlify/functions/whatsapp-webhook';

const createMockWebhook = (phoneNumber: string, message: string) => ({
  object: 'whatsapp_business_account',
  entry: [{
    id: 'mock-entry-id',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '33617370484',
          phone_number_id: process.env.VITE_WHATSAPP_PHONE_NUMBER_ID
        },
        contacts: [{
          profile: {
            name: 'Test User'
          },
          wa_id: phoneNumber
        }],
        messages: [{
          from: phoneNumber,
          id: `mock-message-${Date.now()}`,
          timestamp: (Date.now() / 1000).toString(),
          text: {
            body: message
          },
          type: 'text'
        }]
      },
      field: 'messages'
    }]
  }]
});

export const testWebhookReceive = async () => {
  try {
    const mockPhoneNumber = '33617370484'; // Remplacez par votre numéro de test
    const mockMessage = 'Test message from webhook';
    
    const webhookData = createMockWebhook(mockPhoneNumber, mockMessage);
    
    console.log('📤 Sending mock webhook data:', JSON.stringify(webhookData, null, 2));
    
    const response = await axios.post(WEBHOOK_URL, webhookData);
    
    console.log('✅ Webhook test response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error testing webhook:', error);
    throw error;
  }
};
