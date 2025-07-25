import React, { useState } from 'react';
import Select from 'react-select';
import { Plus, Megaphone, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

interface AnnouncementManagerProps {
  selectedGroupId?: string;
}

export default function AnnouncementManager({ selectedGroupId }: AnnouncementManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<any[]>([]);
  const { user } = useAuth();
  const { groups, announcements, addAnnouncement, getActiveGroups } = useData();

  const teacherGroups = getActiveGroups(user?.id || '');

  // Options pour react-select
  const groupOptions = [
    { value: 'all', label: 'Tous les Groupes' },
    ...teacherGroups.map((group: any) => ({ value: group.id, label: group.name }))
  ];

  // Gestion de la sélection
  const handleGroupChange = (options: any) => {
    if (!options) {
      setSelectedGroups([]);
      return;
    }
    // Si "Tous les groupes" est sélectionné, on ne garde que cette option
    if (Array.isArray(options) && options.some((opt) => opt.value === 'all')) {
      setSelectedGroups([groupOptions[0]]);
    } else {
      setSelectedGroups(options);
    }
  };

  // Filtrage des annonces
  const filteredAnnouncements = selectedGroupId
    ? announcements.filter(ann => ann.teacherId === user?.id && ann.groupId === selectedGroupId)
    : announcements.filter(ann => ann.teacherId === user?.id);

  const handleCreateAnnouncement = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Déterminer les groupes ciblés
    let targetGroups: string[] = [];
    if (selectedGroups.length === 0 || selectedGroups.some((g) => g.value === 'all')) {
      // Tous les groupes
      targetGroups = teacherGroups.map((group: any) => group.id);
    } else {
      targetGroups = selectedGroups.map((g) => g.value);
    }
    // Créer une annonce pour chaque groupe sélectionné
    targetGroups.forEach(groupId => {
      addAnnouncement({
        title: formData.get('title') as string,
        content: formData.get('content') as string,
        teacherId: user?.id || '',
        groupId: groupId,
        priority: formData.get('priority') as 'low' | 'medium' | 'high'
      });
    });
    setShowCreateForm(false);
    setSelectedGroups([]);
    e.currentTarget.reset();
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Info className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'haute priorité';
      case 'medium':
        return 'priorité moyenne';
      default:
        return 'faible priorité';
    }
  };

  const availableGroups = selectedGroupId 
    ? teacherGroups.filter((group: any) => group.id === selectedGroupId)
    : teacherGroups;

  // Styles custom pour react-select
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '0.75rem',
      boxShadow: state.isFocused ? '0 4px 24px 0 rgba(20,115,170,0.15)' : '0 2px 8px 0 rgba(20,115,170,0.10)',
      borderColor: state.isFocused ? '#1473AA' : '#e5e7eb',
      background: '#fff',
      minHeight: '48px',
      fontSize: '1rem',
      padding: '2px 0',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#e0f2fe'
        : state.isFocused
        ? '#f1f5f9'
        : '#fff',
      color: '#222',
      borderRadius: '0.5rem',
      margin: '2px 4px',
      boxShadow: state.isSelected ? '0 2px 8px 0 rgba(20,115,170,0.10)' : undefined,
      fontWeight: state.isSelected ? 600 : 400,
      display: 'flex',
      alignItems: 'center',
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: '#e0f2fe',
      borderRadius: '0.5rem',
      color: '#1473AA',
      fontWeight: 500,
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#1473AA',
      fontWeight: 500,
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#1473AA',
      ':hover': {
        backgroundColor: '#bae6fd',
        color: '#0e7490',
      },
    }),
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-transparent">
        {selectedGroupId && (
          <h2 className="text-2xl font-bold text-gray-900">
            Annonces - Groupe {groups.find((g: any) => g.id === selectedGroupId)?.name}
          </h2>
        )}
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer une Annonce
        </button>
      </div>

      {/* Formulaire de création d'annonce */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une Nouvelle Annonce</h3>
          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="input"
                placeholder="ex: Récital d'Hiver, Nouvelles Partitions Disponibles"
                required
              />
            </div>
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenu
              </label>
              <textarea
                id="content"
                name="content"
                className="textarea"
                rows={4}
                placeholder="Rédigez votre annonce ici..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!selectedGroupId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Groupes Ciblés
                  </label>
                  <Select
                    isMulti
                    options={groupOptions}
                    value={selectedGroups}
                    onChange={handleGroupChange}
                    styles={customSelectStyles}
                    placeholder="Sélectionner un ou plusieurs groupes..."
                    closeMenuOnSelect={false}
                    className="z-50"
                  />
                </div>
              )}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau de Priorité
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="input"
                  required
                >
                  <option value="low">Faible Priorité</option>
                  <option value="medium">Priorité Moyenne</option>
                  <option value="high">Haute Priorité</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Créer l'Annonce
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedGroups([]);
                }}
                className="btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des annonces */}
      {filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12">
          <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {selectedGroupId ? 'Aucune annonce pour ce groupe' : 'Aucune annonce créée pour le moment'}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Créer Votre Première Annonce
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement: any) => {
            const group = announcement.groupId ? groups.find((g: any) => g.id === announcement.groupId) : null;
            const PriorityIcon = getPriorityIcon(announcement.priority);
            
            return (
              <div key={announcement.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                    <p className="text-gray-600 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div>
                        Cible : {group ? group.name : 'Tous les Groupes'}
                      </div>
                      <div>
                        Publié le {format(announcement.createdAt, 'dd MMM yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(announcement.priority)}`}>
                      {PriorityIcon}
                      {getPriorityLabel(announcement.priority)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}