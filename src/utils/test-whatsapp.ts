import { whatsappService } from '../services/whatsapp/whatsappService';

export const testWhatsAppMessage = async () => {
  try {
    const testNumber = '33617370484'; // Remplacez par votre numéro de test
    const message = 'Ceci est un message de test depuis AirHost!';
    
    await whatsappService.sendMessage(testNumber, message);
    console.log('✅ Message WhatsApp envoyé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi du message WhatsApp:', error);
  }
};
