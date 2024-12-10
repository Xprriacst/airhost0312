import React from 'react';

interface PropertyActionsProps {
  property: any;
  onDelete: (id: string) => void;
  onEdit: (property: any) => void;
}

const PropertyActions: React.FC<PropertyActionsProps> = ({ property, onDelete, onEdit }) => {
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => onEdit(property)}
        className="text-blue-600 hover:underline"
      >
        Edit
      </button>
      <button 
        onClick={() => onDelete(property.id)}
        className="text-red-600 hover:underline"
      >
        Delete
      </button>
    </div>
  );
};

export { PropertyActions };
export default PropertyActions;
