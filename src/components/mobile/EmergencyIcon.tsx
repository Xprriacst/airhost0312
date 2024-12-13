import React from 'react';
import { AlertTriangle, Wrench, Package, HelpCircle, AlertOctagon } from 'lucide-react';
import type { EmergencyTag } from '../../types';

interface EmergencyIconProps {
  tag: EmergencyTag;
}

const EmergencyIcon: React.FC<EmergencyIconProps> = ({ tag }) => {
  switch (tag) {
    case 'client_mecontent':
      return <AlertTriangle className="w-4 h-4 text-orange-500" title="Client mécontent" />;
    case 'probleme_technique':
      return <Wrench className="w-4 h-4 text-red-500" title="Problème technique" />;
    case 'probleme_stock':
      return <Package className="w-4 h-4 text-yellow-500" title="Problème de stock" />;
    case 'reponse_inconnue':
      return <HelpCircle className="w-4 h-4 text-blue-500" title="Réponse inconnue" />;
    case 'urgence':
      return <AlertOctagon className="w-4 h-4 text-red-600" title="Urgence" />;
    default:
      return null;
  }
};

export default EmergencyIcon;
