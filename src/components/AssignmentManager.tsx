import React, { useState } from 'react';
import { Plus, BookOpen, Calendar, Clock, Users, Eye, User, FileText, Presentation, Search, X, Music, Mic, Video, Volume2, Pi as Piano, Check, ChevronDown, ChevronUp, Star, MessageSquare, Save, Edit, Filter, CheckCircle, XCircle, Share2, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format, isAfter } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AssignmentManagerProps {
  selectedGroupId?: string;
}

export default function AssignmentManager({ selectedGroupId }: AssignmentManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewingSubmissions, setViewingSubmissions] = useState<string | null>(null);
  const [viewingSubmissionDetail, setViewingSubmissionDetail] = useState<string | null>(null);
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [selectedStudents, setSelectedStudents] = useState<string>('all');
  const { user } = useAuth();
  const { groups, assignments, addAssignment, getStudentsByGroup, getActiveGroups, users, evaluateAssignment } = useData();

  const teacherGroups = getActiveGroups(user?.id || '');
  const filteredAssignments = selectedGroupId 
    ? assignments.filter(assign => assign.groupIds.includes(selectedGroupId))
    : assignments.filter(assign => assign.teacherId === user?.id);

  const handleCreateAssignment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Determine assigned students based on selection
    let assignedStudentIds: string[] = [];
    if (selectedGroup) {
      const groupStudents = getStudentsByGroup(selectedGroup);
      if (selectedStudents === 'all') {
        assignedStudentIds = groupStudents.map(s => s.id);
      } else {
        assignedStudentIds = [selectedStudents];
      }
    }
    
    addAssignment({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      dueDate: new Date(formData.get('dueDate') as string),
      groupIds: selectedGroup ? [selectedGroup] : [],
      assignedStudentIds,
      teacherId: user?.id || '',
      type: formData.get('type') as 'theory' | 'audio_recording' | 'video_recording' | 'solfege_dictation' | 'instrumental' | 'other',
      maxPoints: parseInt(formData.get('maxPoints') as string)
    });

    setShowCreateForm(false);
    setSelectedGroup('');
    setSelectedStudents('all');
    e.currentTarget.reset();
  };

  const handleGroupChange = (groupId: string) => {
    setSelectedGroup(groupId);
    setSelectedStudents('all'); // Reset to "all students" when group changes
  };

  const handleEvaluateSubmission = (submissionId: string, grade: number, feedback: string) => {
    evaluateAssignment(submissionId, grade, feedback);
    setEvaluatingSubmission(null);
  };

  const getAssignmentStats = (assignment: any) => {
    const totalStudents = assignment.assignedStudentIds.length;
    const submittedCount = assignment.submissions.length;
    const evaluatedCount = assignment.submissions.filter((sub: any) => sub.grade !== undefined).length;
    const isOverdue = isAfter(new Date(), assignment.dueDate);
    
    return { totalStudents, submittedCount, evaluatedCount, isOverdue };
  };

  const getStudentName = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : `Élève ${studentId}`;
  };

  const getStudentPicture = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student?.picture;
  };

  const getGroupName = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Groupe inconnu';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'theory':
        return <BookOpen className="w-4 h-4" />;
      case 'audio_recording':
        return <Mic className="w-4 h-4" />;
      case 'video_recording':
        return <Video className="w-4 h-4" />;
      case 'solfege_dictation':
        return <Volume2 className="w-4 h-4" />;
      case 'instrumental':
        return <Piano className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'theory':
        return 'Théorie';
      case 'audio_recording':
        return 'Enregistrement Audio';
      case 'video_recording':
        return 'Enregistrement Vidéo';
      case 'solfege_dictation':
        return 'Solfège/Dictée';
      case 'instrumental':
        return 'Instrumental';
      default:
        return 'Autre';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory':
        return 'bg-blue-100 text-blue-800';
      case 'audio_recording':
        return 'bg-green-100 text-green-800';
      case 'video_recording':
        return 'bg-purple-100 text-purple-800';
      case 'solfege_dictation':
        return 'bg-orange-100 text-orange-800';
      case 'instrumental':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: number, maxPoints: number) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLabel = (grade: number, maxPoints: number) => {
    const percentage = (grade / maxPoints) * 100;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Très bien';
    if (percentage >= 70) return 'Bien';
    if (percentage >= 60) return 'Satisfaisant';
    return 'À améliorer';
  };

  // Get students for the selected group
  const groupStudents = selectedGroup ? getStudentsByGroup(selectedGroup) : [];

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}

      <div className="flex justify-between items-center mb-4">
        {selectedGroupId && (
          <h2 className="text-2xl font-bold text-gray-900">
            Devoirs - Groupe {groups.find(g => g.id === selectedGroupId)?.name}
          </h2>
        )}
        {/* Bouton déplacé ici */}
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Créer un Devoir
        </button>
      </div>

      {/* Formulaire de création de devoir */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un Nouveau Devoir</h3>
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre du Devoir
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="input"
                placeholder="ex: Analyse harmonique, Enregistrement d'une gamme, Dictée mélodique"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description et Consignes
              </label>
              <textarea
                id="description"
                name="description"
                className="textarea"
                rows={4}
                placeholder="Décrivez les objectifs, les consignes détaillées, les critères d'évaluation..."
                required
              />
            </div>

            {/* Sélection du groupe et des élèves avec menus déroulants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="groupSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigner au Groupe
                </label>
                <select
                  id="groupSelect"
                  value={selectedGroup}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="input"
                  required
                >
                  <option value="">Sélectionner un groupe</option>
                  {teacherGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      Groupe {group.name} ({getStudentsByGroup(group.id).length} élèves)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="studentSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner les Élèves
                </label>
                <select
                  id="studentSelect"
                  value={selectedStudents}
                  onChange={(e) => setSelectedStudents(e.target.value)}
                  className="input"
                  disabled={!selectedGroup}
                  required
                >
                  <option value="all">
                    Tous les élèves ({groupStudents.length})
                  </option>
                  {groupStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.instrument})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Aperçu de l'assignation */}
            {selectedGroup && (
              <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                <h4 className="text-sm font-medium text-primary-900 mb-2">Aperçu de l'Assignation</h4>
                <div className="text-sm text-primary-700">
                  <p><strong>Groupe :</strong> {getGroupName(selectedGroup)}</p>
                  <p><strong>Élèves assignés :</strong> {
                    selectedStudents === 'all' 
                      ? `Tous les élèves (${groupStudents.length})`
                      : getStudentName(selectedStudents)
                  }</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type de Devoir
                </label>
                <select
                  id="type"
                  name="type"
                  className="input"
                  required
                >
                  <option value="theory">Théorie</option>
                  <option value="audio_recording">Enregistrement Audio</option>
                  <option value="video_recording">Enregistrement Vidéo</option>
                  <option value="solfege_dictation">Solfège/Dictée</option>
                  <option value="instrumental">Instrumental</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label htmlFor="maxPoints" className="block text-sm font-medium text-gray-700 mb-2">
                  Points Maximum
                </label>
                <input
                  type="number"
                  id="maxPoints"
                  name="maxPoints"
                  className="input"
                  placeholder="100"
                  min="1"
                  max="1000"
                  defaultValue="100"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date et Heure Limite
              </label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                className="input"
                required
              />
            </div>
            <div className="flex gap-3">
              <button 
                type="submit" 
                className="btn-primary"
                disabled={!selectedGroup}
              >
                Créer le Devoir
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedGroup('');
                  setSelectedStudents('all');
                }}
                className="btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des devoirs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-5 h-5 text-gray-600" />
              Filtrer
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredAssignments.map((assignment) => {
            const stats = getAssignmentStats(assignment);
            const TypeIcon = getTypeIcon(assignment.type);

            return (
              <div key={assignment.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{assignment.title}</h4>
                    <p className="text-sm text-gray-600">
                      {assignment.description}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    stats.isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {stats.isOverdue ? 'En retard' : 'Actif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Échéance: {format(assignment.dueDate, 'dd MMM', { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{assignment.groupIds.length > 1 ? `${assignment.groupIds.length} groupes` : `Groupe ${getGroupName(assignment.groupIds[0])}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Temps estimé: {30 + assignment.maxPoints * 15} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span>{assignment.maxPoints} points</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Voir le devoir
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <MessageSquare className="w-4 h-4" />
                    Demander de l'aide
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Share2 className="w-4 h-4" />
                    Partager
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                    Télécharger
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Composant pour le formulaire d'évaluation
function EvaluationForm({ 
  submission, 
  maxPoints, 
  onSubmit, 
  onCancel 
}: { 
  submission: any; 
  maxPoints: number; 
  onSubmit: (grade: number, feedback: string) => void; 
  onCancel: () => void; 
}) {
  const [grade, setGrade] = useState(submission.grade || '');
  const [feedback, setFeedback] = useState(submission.feedback || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (grade === '' || isNaN(Number(grade))) return;
    onSubmit(Number(grade), feedback);
  };

  const getGradeColor = (gradeValue: number) => {
    const percentage = (gradeValue / maxPoints) * 100;
    if (percentage >= 90) return 'border-green-500 bg-green-50';
    if (percentage >= 80) return 'border-blue-500 bg-blue-50';
    if (percentage >= 70) return 'border-yellow-500 bg-yellow-50';
    if (percentage >= 60) return 'border-orange-500 bg-orange-50';
    return 'border-red-500 bg-red-50';
  };

  const getGradeLabel = (gradeValue: number) => {
    const percentage = (gradeValue / maxPoints) * 100;
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Très bien';
    if (percentage >= 70) return 'Bien';
    if (percentage >= 60) return 'Satisfaisant';
    return 'À améliorer';
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h5 className="font-medium text-blue-900 mb-4 flex items-center gap-2">
        <Star className="w-5 h-5" />
        Évaluation du Devoir
      </h5>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
              Note (sur {maxPoints} points)
            </label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={`input ${grade ? getGradeColor(Number(grade)) : ''}`}
              min="0"
              max={maxPoints}
              step="0.5"
              placeholder={`0 - ${maxPoints}`}
              required
            />
            {grade && !isNaN(Number(grade)) && (
              <p className="text-sm mt-1 font-medium">
                {Math.round((Number(grade) / maxPoints) * 100)}% - {getGradeLabel(Number(grade))}
              </p>
            )}
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-600">
              <p><strong>Barème suggéré :</strong></p>
              <p>• 90-100% : Excellent</p>
              <p>• 80-89% : Très bien</p>
              <p>• 70-79% : Bien</p>
              <p>• 60-69% : Satisfaisant</p>
              <p>• &lt;60% : À améliorer</p>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
            Commentaires et Rétroaction
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="textarea"
            rows={4}
            placeholder="Donnez des commentaires constructifs sur le travail de l'élève : points forts, axes d'amélioration, conseils pour progresser..."
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            disabled={!grade || isNaN(Number(grade))}
          >
            <Save className="w-4 h-4" />
            Enregistrer l'Évaluation
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
    </div>
  );
}