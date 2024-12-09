import React from 'react';
import { Home, Users, Clock, Wifi, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="relative h-48">
        <img
          src={property.photos[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6'}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/properties/${property.id}/config`);
            }}
            className="bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <span className="sr-only">Configure</span>
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(property.id);
            }}
            className="bg-white p-2 rounded-full shadow-lg hover:bg-red-50 transition-colors"
          >
            <span className="sr-only">Delete</span>
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.name}</h3>
        <p className="text-gray-600 mb-4 flex items-center gap-2">
          <Home className="w-4 h-4" />
          {property.address}
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>Max {property.maxGuests} guests</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Check-in: {property.checkInTime}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Wifi className="w-4 h-4" />
            <span>WiFi Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
