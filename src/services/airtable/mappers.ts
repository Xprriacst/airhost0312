import type { Property, Conversation } from '../../types';
import { messageUtils, arrayUtils } from './utils';

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
    houseRules: arrayUtils.parseArray(record.get('House Rules')),
    amenities: arrayUtils.parseArray(record.get('Amenities')),
    checkInTime: record.get('Check-in Time') || '',
    checkOutTime: record.get('Check-out Time') || '',
    maxGuests: Number(record.get('Max Guests')) || 0,
    photos: Array.isArray(record.get('Photos')) ? record.get('Photos') : [],
    description: record.get('Description') || '',
    parkingInfo: record.get('Parking Info') || '',
    restaurants: arrayUtils.parseArray(record.get('Restaurants')),
    fastFood: arrayUtils.parseArray(record.get('Fast Food')),
    emergencyContacts: arrayUtils.parseArray(record.get('Emergency Contacts'))
  };
};

export const mapRecordToConversation = (record: any): Conversation => {
  return {
    id: record.id,
    propertyId: Array.isArray(record.get('Properties')) 
      ? record.get('Properties')[0] 
      : record.get('Properties'),
    guestName: record.get('Guest Name') as string,
    guestEmail: record.get('Guest Email') as string,
    checkIn: record.get('Check-in Date') as string,
    checkOut: record.get('Check-out Date') as string,
    messages: messageUtils.parse(record.get('Messages')),
    status: record.get('Status') as string,
    platform: record.get('Platform') as string
  };
};
