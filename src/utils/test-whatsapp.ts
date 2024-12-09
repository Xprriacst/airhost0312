import { whatsappService } from '../services/whatsapp/whatsappService';
import { getEnvVar } from '../utils/env';

const testWhatsAppMessage = async () => {
  try {
    // Verify environment variables before starting the test
    const phoneNumberId = getEnvVar('VITE_WHATSAPP_PHONE_NUMBER_ID');
    const accessToken = getEnvVar('VITE_WHATSAPP_ACCESS_TOKEN');
    
    if (!phoneNumberId || !accessToken) {
      console.error('❌ Missing required WhatsApp configuration:');
      if (!phoneNumberId) console.error('- VITE_WHATSAPP_PHONE_NUMBER_ID is not set');
      if (!accessToken) console.error('- VITE_WHATSAPP_ACCESS_TOKEN is not set');
      process.exit(1);
    }

    console.log('🚀 Starting WhatsApp test...');
    
    const testNumber = '33617370484'; // Replace with your test number
    const message = 'Test message from AirHost!';
    
    console.log(`📱 Sending message to ${testNumber}:`, message);
    
    await whatsappService.sendMessage(testNumber, message);
    console.log('✅ WhatsApp message sent successfully');
  } catch (error) {
    console.error('❌ WhatsApp test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    process.exit(1);
  }
};

// Run the test if this file is executed directly
if (require.main === module) {
  testWhatsAppMessage();
}
