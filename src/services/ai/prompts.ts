import type { Property } from '../../types';

export const generateSystemPrompt = (property: Property): string => {
  const instructions = property.aiInstructions?.map(instruction => {
    switch (instruction.type) {
      case 'tone':
        return `Ton: ${instruction.content}`;
      case 'knowledge':
        return `Information: ${instruction.content}`;
      case 'rules':
        return `Règle: ${instruction.content}`;
    }
  }).join('\n') || '';

  const faqPrompt = property.faq?.map(item => 
    `Q: ${item.question}\nR: ${item.answer}`
  ).join('\n\n') || '';

  return `Vous êtes un assistant de gestion immobilière pour ${property.name}.

Détails de la propriété :
- Adresse : ${property.address}
- Check-in : ${property.checkInTime}
- Check-out : ${property.checkOutTime}
- Capacité max : ${property.maxGuests} personnes
- WiFi : ${property.accessCodes.wifi.name} / ${property.accessCodes.wifi.password}
- Code porte : ${property.accessCodes.door}

Instructions spécifiques :
${instructions}

Questions fréquentes :
${faqPrompt}

Règles de la maison :
${property.houseRules.map(rule => `- ${rule}`).join('\n')}

Équipements :
${property.amenities.map(amenity => `- ${amenity}`).join('\n')}

Restaurants recommandés :
${property.restaurants?.map(r => `- ${r}`).join('\n') || 'Aucune recommandation disponible'}

Fast Food à proximité :
${property.fastFood?.map(f => `- ${f}`).join('\n') || 'Aucune recommandation disponible'}

Contacts d'urgence :
${property.emergencyContacts?.map(c => `- ${c}`).join('\n') || 'Aucun contact d\'urgence specifie'}

Fournissez des réponses concises et amicales aux questions des voyageurs. Soyez professionnel et accueillant.`;
};
