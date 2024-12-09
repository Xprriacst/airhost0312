import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, MessageSquare, Zap, Settings } from 'lucide-react';
import { propertyService } from '../services';
import type { Property, AIInstruction, FAQItem } from '../types';

const PropertyConfig: React.FC = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'ai' | 'faq'>('general');
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) return;
      try {
        const data = await propertyService.getPropertyById(propertyId);
        setProperty(data);
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  const handleSave = async () => {
    if (!property) return;
    setSaving(true);
    try {
      await propertyService.updateProperty(property.id, property);
    } catch (error) {
      console.error('Error saving property:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Property not found
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{property.name}</h1>
            <p className="text-sm text-gray-500">{property.address}</p>
          </div>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Home className="w-4 h-4 inline-block mr-2" />
            Informations générales
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'ai'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Zap className="w-4 h-4 inline-block mr-2" />
            Configuration IA
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'faq'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline-block mr-2" />
            FAQ
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Informations de base</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={property.name}
                    onChange={(e) => setProperty({ ...property, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Adresse</label>
                  <input
                    type="text"
                    value={property.address}
                    onChange={(e) => setProperty({ ...property, address: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Codes d'accès</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du WiFi</label>
                  <input
                    type="text"
                    value={property.accessCodes.wifi.name}
                    onChange={(e) => setProperty({
                      ...property,
                      accessCodes: {
                        ...property.accessCodes,
                        wifi: { ...property.accessCodes.wifi, name: e.target.value }
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mot de passe WiFi</label>
                  <input
                    type="text"
                    value={property.accessCodes.wifi.password}
                    onChange={(e) => setProperty({
                      ...property,
                      accessCodes: {
                        ...property.accessCodes,
                        wifi: { ...property.accessCodes.wifi, password: e.target.value }
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Code porte</label>
                  <input
                    type="text"
                    value={property.accessCodes.door}
                    onChange={(e) => setProperty({
                      ...property,
                      accessCodes: {
                        ...property.accessCodes,
                        door: e.target.value
                      }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Instructions pour l'IA</h2>
            <div className="space-y-4">
              {property.aiInstructions?.map((instruction, index) => (
                <div key={instruction.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <select
                      value={instruction.type}
                      onChange={(e) => {
                        const newInstructions = [...(property.aiInstructions || [])];
                        newInstructions[index] = {
                          ...instruction,
                          type: e.target.value as AIInstruction['type']
                        };
                        setProperty({ ...property, aiInstructions: newInstructions });
                      }}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="tone">Ton</option>
                      <option value="knowledge">Connaissances</option>
                      <option value="rules">Règles</option>
                    </select>
                    <button
                      onClick={() => {
                        const newInstructions = property.aiInstructions?.filter((_, i) => i !== index);
                        setProperty({ ...property, aiInstructions: newInstructions });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                  <textarea
                    value={instruction.content}
                    onChange={(e) => {
                      const newInstructions = [...(property.aiInstructions || [])];
                      newInstructions[index] = {
                        ...instruction,
                        content: e.target.value
                      };
                      setProperty({ ...property, aiInstructions: newInstructions });
                    }}
                    rows={3}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newInstruction: AIInstruction = {
                    id: Date.now().toString(),
                    propertyId: property.id,
                    type: 'tone',
                    content: '',
                    isActive: true,
                    priority: (property.aiInstructions?.length || 0) + 1
                  };
                  setProperty({
                    ...property,
                    aiInstructions: [...(property.aiInstructions || []), newInstruction]
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Ajouter une instruction
              </button>
            </div>
          </div>
        )}

        {activeTab === 'faq' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Questions fréquentes</h2>
            <div className="space-y-4">
              {property.faq?.map((item, index) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex justify-between mb-2">
                    <select
                      value={item.category}
                      onChange={(e) => {
                        const newFaq = [...(property.faq || [])];
                        newFaq[index] = {
                          ...item,
                          category: e.target.value as FAQItem['category']
                        };
                        setProperty({ ...property, faq: newFaq });
                      }}
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="check-in">Check-in</option>
                      <option value="check-out">Check-out</option>
                      <option value="wifi">WiFi</option>
                      <option value="parking">Parking</option>
                      <option value="house-rules">Règles</option>
                      <option value="general">Général</option>
                    </select>
                    <button
                      onClick={() => {
                        const newFaq = property.faq?.filter((_, i) => i !== index);
                        setProperty({ ...property, faq: newFaq });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      Supprimer
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.question}
                    onChange={(e) => {
                      const newFaq = [...(property.faq || [])];
                      newFaq[index] = {
                        ...item,
                        question: e.target.value
                      };
                      setProperty({ ...property, faq: newFaq });
                    }}
                    placeholder="Question"
                    className="w-full mb-2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  <textarea
                    value={item.answer}
                    onChange={(e) => {
                      const newFaq = [...(property.faq || [])];
                      newFaq[index] = {
                        ...item,
                        answer: e.target.value
                      };
                      setProperty({ ...property, faq: newFaq });
                    }}
                    rows={3}
                    placeholder="Réponse"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newFaqItem: FAQItem = {
                    id: Date.now().toString(),
                    propertyId: property.id,
                    question: '',
                    answer: '',
                    category: 'general',
                    isActive: true,
                    useCount: 0
                  };
                  setProperty({
                    ...property,
                    faq: [...(property.faq || []), newFaqItem]
                  });
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Ajouter une FAQ
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyConfig;
