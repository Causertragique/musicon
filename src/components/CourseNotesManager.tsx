import React, { useState } from 'react';
import { Plus, BookOpen, Search, Tag, Edit, Trash2, Save, X, Eye, Filter, Upload, FileText, Image, Music, Video, File, Download, Trash } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

interface CourseNotesManagerProps {
  selectedGroupId?: string;
}

export default function CourseNotesManager({ selectedGroupId }: CourseNotesManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [viewingNote, setViewingNote] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { user } = useAuth();
  const { groups, courseNotes, addCourseNote, updateCourseNote, deleteCourseNote, getActiveGroups } = useData();

  const teacherGroups = getActiveGroups(user?.id || '');
  
  // Filter notes based on selected group
  const filteredNotes = courseNotes
    .filter(note => note.teacherId === user?.id)
    .filter(note => {
      if (selectedGroupId) {
        return !note.groupId || note.groupId === selectedGroupId;
      }
      return true;
    })
    .filter(note => {
      if (searchTerm) {
        return note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
               note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return true;
    })
    .filter(note => {
      if (categoryFilter !== 'all') {
        return note.category === categoryFilter;
      }
      return true;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleCreateNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(tag => tag);
    
    // Process uploaded files
    const attachments = uploadedFiles.map(file => ({
      id: `file_${Date.now()}_${Math.random()}`,
      fileName: `${Date.now()}_${file.name}`,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      url: URL.createObjectURL(file), // In real app, this would be uploaded to server
      uploadedAt: new Date()
    }));
    
    addCourseNote({
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      teacherId: user?.id || '',
      groupId: selectedGroup || undefined,
      category: formData.get('category') as 'theory' | 'technique' | 'repertoire' | 'history' | 'other',
      tags,
      attachments
    });

    setShowCreateForm(false);
    setSelectedGroup('');
    setUploadedFiles([]);
    e.currentTarget.reset();
  };

  const handleUpdateNote = (noteId: string, formData: FormData) => {
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(tag => tag);
    
    updateCourseNote(noteId, {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      groupId: formData.get('groupId') as string || undefined,
      category: formData.get('category') as 'theory' | 'technique' | 'repertoire' | 'history' | 'other',
      tags
    });

    setEditingNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteCourseNote(noteId);
    setDeleteConfirm(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (mimeType.startsWith('audio/')) return <Music className="w-4 h-4" />;
    if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (mimeType === 'application/pdf') return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theory':
        return '📚';
      case 'technique':
        return '🎯';
      case 'repertoire':
        return '🎼';
      case 'history':
        return '📜';
      default:
        return '📝';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'theory':
        return 'Théorie';
      case 'technique':
        return 'Technique';
      case 'repertoire':
        return 'Répertoire';
      case 'history':
        return 'Histoire';
      default:
        return 'Autre';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'theory':
        return 'bg-blue-100 text-blue-800';
      case 'technique':
        return 'bg-green-100 text-green-800';
      case 'repertoire':
        return 'bg-purple-100 text-purple-800';
      case 'history':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGroupName = (groupId?: string) => {
    if (!groupId) return 'Tous les Groupes';
    const group = groups.find(g => g.id === groupId);
    return group ? `Groupe ${group.name}` : 'Groupe inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {selectedGroupId && (
          <h2 className="text-2xl font-bold text-gray-900">
            Notes de Cours - Groupe {groups.find(g => g.id === selectedGroupId)?.name}
          </h2>
        )}
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer une Note
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher dans les notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes les catégories</option>
                <option value="theory">Théorie</option>
                <option value="technique">Technique</option>
                <option value="repertoire">Répertoire</option>
                <option value="history">Histoire</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Créer une Note
            </button>
          </div>
        </div>
      </div>

      {/* Formulaire de création de note */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer une Nouvelle Note de Cours</h3>
          <form onSubmit={handleCreateNote} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la Note
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="input"
                placeholder="ex: Les Gammes Majeures, Technique de l'Archet"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenu de la Note
              </label>
              <textarea
                id="content"
                name="content"
                className="textarea"
                rows={8}
                placeholder="Rédigez le contenu détaillé de votre note de cours. Vous pouvez utiliser du markdown pour la mise en forme."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  id="category"
                  name="category"
                  className="input"
                  required
                >
                  <option value="theory">Théorie</option>
                  <option value="technique">Technique</option>
                  <option value="repertoire">Répertoire</option>
                  <option value="history">Histoire</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe Ciblé
                </label>
                <select
                  id="groupSelect"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="input"
                >
                  <option value="">Tous les Groupes</option>
                  {teacherGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      Groupe {group.name} ({group.studentIds.length} élèves)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (séparés par des virgules)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  className="input"
                  placeholder="ex: gammes, théorie, majeur"
                />
              </div>
            </div>

            {/* Upload de documents */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Documents Joints
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.avi,.mov,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn-outline cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Sélectionner des fichiers
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Formats supportés: PDF, DOC, DOCX, JPG, PNG, MP3, MP4, PPT, XLS, TXT, ZIP, etc.
                </p>
              </div>

              {/* Liste des fichiers uploadés */}
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Fichiers sélectionnés :</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUploadedFile(index)}
                        className="p-1 text-red-500 hover:text-red-700 rounded"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Créer la Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedGroup('');
                  setUploadedFiles([]);
                }}
                className="btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des notes */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Aucune note trouvée avec ces critères'
              : selectedGroupId 
                ? 'Aucune note pour ce groupe pour le moment'
                : 'Aucune note de cours créée pour le moment'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              Créer Votre Première Note
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredNotes.map((note) => {
            const isEditing = editingNote === note.id;
            const isViewing = viewingNote === note.id;
            const isConfirmingDelete = deleteConfirm === note.id;
            
            return (
              <div key={note.id} className="card">
                {isEditing ? (
                  <EditNoteForm 
                    note={note}
                    groups={teacherGroups}
                    onSave={(formData) => handleUpdateNote(note.id, formData)}
                    onCancel={() => setEditingNote(null)}
                  />
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                          <span className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(note.category)}`}>
                            <span>{getCategoryIcon(note.category)}</span>
                            {getCategoryLabel(note.category)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            Cible : {getGroupName(note.groupId)}
                          </div>
                          <div>
                            Créé le {format(note.createdAt, 'dd MMM yyyy')}
                          </div>
                          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                            <div>
                              Modifié le {format(note.updatedAt, 'dd MMM yyyy')}
                            </div>
                          )}
                        </div>

                        {note.tags.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            <Tag className="w-4 h-4 text-gray-400" />
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Fichiers joints */}
                        {note.attachments && note.attachments.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Fichiers joints :</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {note.attachments.map((attachment) => (
                                <div key={attachment.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                  {getFileIcon(attachment.mimeType)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {attachment.originalName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {formatFileSize(attachment.fileSize)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => window.open(attachment.url, '_blank')}
                                    className="p-1 text-primary-500 hover:text-primary-700 rounded"
                                    title="Télécharger"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!isViewing && (
                          <div className="text-gray-600 line-clamp-3">
                            {note.content.substring(0, 200)}...
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingNote(isViewing ? null : note.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title={isViewing ? "Masquer le contenu" : "Voir le contenu complet"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingNote(note.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Modifier la note"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(note.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                          title="Supprimer la note"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Contenu complet */}
                    {isViewing && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Contenu Complet</h4>
                          <div className="prose prose-sm max-w-none">
                            <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                              {note.content}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Confirmation de suppression */}
                    {isConfirmingDelete && (
                      <div className="border-t border-gray-200 pt-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Trash2 className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-800">Confirmer la suppression</span>
                          </div>
                          <p className="text-red-700 text-sm mb-3">
                            Êtes-vous sûr de vouloir supprimer la note "{note.title}" ? 
                            Cette action est irréversible.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                            >
                              Oui, supprimer
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Statistiques des notes */}
      {filteredNotes.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des Notes</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{filteredNotes.length}</div>
              <div className="text-sm text-gray-600">Notes Totales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredNotes.filter(n => n.category === 'theory').length}
              </div>
              <div className="text-sm text-gray-600">Théorie</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredNotes.filter(n => n.category === 'technique').length}
              </div>
              <div className="text-sm text-gray-600">Technique</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {filteredNotes.filter(n => n.category === 'repertoire').length}
              </div>
              <div className="text-sm text-gray-600">Répertoire</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredNotes.filter(n => n.category === 'history').length}
              </div>
              <div className="text-sm text-gray-600">Histoire</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditNoteForm({ 
  note, 
  groups, 
  onSave, 
  onCancel 
}: { 
  note: any; 
  groups: any[]; 
  onSave: (formData: FormData) => void; 
  onCancel: () => void; 
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
          Titre de la Note
        </label>
        <input
          type="text"
          id="edit-title"
          name="title"
          className="input"
          defaultValue={note.title}
          required
        />
      </div>
      <div>
        <label htmlFor="edit-content" className="block text-sm font-medium text-gray-700 mb-2">
          Contenu de la Note
        </label>
        <textarea
          id="edit-content"
          name="content"
          className="textarea"
          rows={8}
          defaultValue={note.content}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-2">
            Catégorie
          </label>
          <select
            id="edit-category"
            name="category"
            className="input"
            defaultValue={note.category}
            required
          >
            <option value="theory">Théorie</option>
            <option value="technique">Technique</option>
            <option value="repertoire">Répertoire</option>
            <option value="history">Histoire</option>
            <option value="other">Autre</option>
          </select>
        </div>
        <div>
          <label htmlFor="edit-groupId" className="block text-sm font-medium text-gray-700 mb-2">
            Groupe Ciblé
          </label>
          <select
            id="edit-groupId"
            name="groupId"
            className="input"
            defaultValue={note.groupId || ''}
          >
            <option value="">Tous les Groupes</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                Groupe {group.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="edit-tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags (séparés par des virgules)
          </label>
          <input
            type="text"
            id="edit-tags"
            name="tags"
            className="input"
            defaultValue={note.tags.join(', ')}
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          Sauvegarder
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Annuler
        </button>
      </div>
    </form>
  );
}