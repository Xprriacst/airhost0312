import type { Property } from '../../types';

export const mapRecordToProperty = (record: any): Property => {
  return {
    id: record.id,
    name: record.get('Name') || '',
    address: record.get('Address') || '',
    accessCodes: {
      wifi: {
        name: record.get('WiFi Name') || '',
        password: record.get('WiFi Password') || ''
      },
      door: record.get('Door Code') || ''
    },
    houseRules: (record.get('House Rules') || '').split('\n').filter(Boolean),
    amenities: [],
    checkInTime: record.get('Check-in Time') || '',
    checkOutTime: record.get('Check-out Time') || '',
    maxGuests: record.get('Max Guests') || 0,
    photos: (record.get('Photos') || []).map((photo: any) => photo.url),
    description: record.get('Description') || '',
    parkingInfo: record.get('Parking Info') || '',
    restaurants: (record.get('Restaurants') || '').split('\n').filter(Boolean),
    fastFood: (record.get('Fast Food') || '').split('\n').filter(Boolean),
    emergencyContacts: (record.get('Emergency Contacts') || '').split('\n').filter(Boolean),
    autoPilot: record.get('Auto Pilot') || false
  };
};
