import React, { useState } from 'react';
import { Plus, Music, Calendar, Clock, Users, Eye, User, Home, School, ChevronDown, ChevronUp, BarChart3, TrendingUp, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format, isAfter, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';

interface HomeworkManagerProps {
  selectedGroupId: string;
}

export default function HomeworkManager({ selectedGroupId }: HomeworkManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewingSubmissions, setViewingSubmissions] = useState<string | null>(null);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [viewingPracticeDetail, setViewingPracticeDetail] = useState<string | null>(null);
  const { user } = useAuth();
  const { groups, homework, addHomework, users, getStudentPracticeReports, getStudentsByGroup, getActiveGroups } = useData();

  const teacherGroups = getActiveGroups(user?.id || '');
  const filteredHomework = selectedGroupId 
    ? homework.filter(hw => hw.groupId === selectedGroupId)
    : homework.filter(hw => hw.teacherId === user?.id);

  // Get students for the selected group or all students
  const students = selectedGroupId 
    ? getStudentsByGroup(selectedGroupId)
    : teacherGroups.flatMap(group => getStudentsByGroup(group.id));

  const handleCreateHomework = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addHomework({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      dueDate: new Date(formData.get('dueDate') as string),
      groupId: formData.get('groupId') as string,
      teacherId: user?.id || ''
    });

    setShowCreateForm(false);
    e.currentTarget.reset();
  };

  const getHomeworkStats = (hw: any) => {
    const totalStudents = groups.find(g => g.id === hw.groupId)?.studentIds.length || 0;
    const submittedCount = hw.submissions.length;
    const isOverdue = isAfter(new Date(), hw.dueDate);
    
    return { totalStudents, submittedCount, isOverdue };
  };

  const getStudentName = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : `Élève ${studentId}`;
  };

  const getStudentPicture = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student?.picture;
  };

  // Calculate student practice statistics
  const getStudentStats = (studentId: string) => {
    const practiceReports = getStudentPracticeReports(studentId);
    const totalPracticeTime = practiceReports.reduce((total, report) => total + report.duration, 0);
    const averagePracticeTime = practiceReports.length > 0 ? Math.round(totalPracticeTime / practiceReports.length) : 0;
    
    // Calculate weekly average
    const now = new Date();
    const weeksToCheck = 4;
    let totalWeeklyTime = 0;
    let weeksWithPractice = 0;
    
    for (let i = 0; i < weeksToCheck; i++) {
      const weekStart = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = endOfWeek(weekStart);
      
      const weekPractices = practiceReports.filter(report => 
        isWithinInterval(report.practiceDate, { start: weekStart, end: weekEnd })
      );
      
      if (weekPractices.length > 0) {
        totalWeeklyTime += weekPractices.reduce((sum, report) => sum + report.duration, 0);
        weeksWithPractice++;
      }
    }
    
    const weeklyAverage = weeksWithPractice > 0 ? Math.round(totalWeeklyTime / weeksWithPractice) : 0;

    // Calculate this month's practice
    const thisMonthPractices = practiceReports.filter(report => 
      isWithinInterval(report.practiceDate, { start: startOfMonth(now), end: endOfMonth(now) })
    );
    const thisMonthTime = thisMonthPractices.reduce((total, report) => total + report.duration, 0);

    return {
      totalPractices: practiceReports.length,
      totalTime: totalPracticeTime,
      averageTime: averagePracticeTime,
      weeklyAverage,
      thisMonthTime,
      thisMonthPractices: thisMonthPractices.length,
      recentPractices: practiceReports.slice(0, 5) // Last 5 practices
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-transparent">
      </div>

      {/* Résumé des statistiques des élèves */}
      {students.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-600" />
            Statistiques de Pratique des Élèves
            {selectedGroupId && (
              <span className="text-sm font-normal text-gray-600">
                - Groupe {groups.find(g => g.id === selectedGroupId)?.name}
              </span>
            )}
          </h3>
          
          <div className="space-y-4">
            {students.map((student) => {
              const stats = getStudentStats(student.id);
              const isExpanded = expandedStudent === student.id;
              
              return (
                <div key={student.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {student.picture ? (
                            <img
                              src={student.picture}
                              alt={`${student.firstName} ${student.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">{student.instrument}</p>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-6 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-600">{stats.totalPractices}</div>
                            <div className="text-xs text-gray-600">Pratiques</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-600">
                              {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}m
                            </div>
                            <div className="text-xs text-gray-600">Temps Total</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-purple-600">{stats.averageTime}min</div>
                            <div className="text-xs text-gray-600">Durée Moyenne</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-orange-600">{stats.weeklyAverage}min</div>
                            <div className="text-xs text-gray-600">Durée Moyenne par Semaine</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>
                  
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Ce mois-ci */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Ce mois-ci</h5>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-sm text-gray-600">Nombre de pratiques</span>
                              <div className="font-medium">{stats.thisMonthPractices}</div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-sm text-gray-600">Temps total</span>
                              <div className="font-medium">
                                {Math.floor(stats.thisMonthTime / 60)}h {stats.thisMonthTime % 60}min
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                              <span className="text-sm text-gray-600">Durée moyenne par semaine</span>
                              <div className="font-medium">{stats.weeklyAverage} minutes</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Pratiques récentes */}
                        <div>
                          <h5 className="font-medium text-gray-900 mb-3">Pratiques Récentes</h5>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {stats.recentPractices.length === 0 ? (
                              <p className="text-sm text-gray-500 italic">Aucune pratique enregistrée</p>
                            ) : (
                              stats.recentPractices.map((practice) => (
                                <div key={practice.id} className="p-3 bg-white rounded-lg">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm font-medium">
                                      {format(practice.practiceDate, 'dd/MM/yyyy')}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                      <span>{practice.duration}min</span>
                                      {practice.location === 'home' ? (
                                        <Home className="w-3 h-3" />
                                      ) : (
                                        <School className="w-3 h-3" />
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2">
                                    {practice.content}
                                  </p>
                                  {practice.type === 'homework' && practice.homeworkTitle && (
                                    <div className="mt-1 text-xs text-blue-600 font-medium">
                                      📝 {practice.homeworkTitle}
                                    </div>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Tableau des pratiques - même format que la version élève */}
                      <div className="mt-6">
                        <h5 className="font-medium text-gray-900 mb-3">Historique Complet des Pratiques</h5>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Durée</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Lieu</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Contenu</th>
                                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stats.recentPractices.length === 0 ? (
                                <tr>
                                  <td colSpan={5} className="text-center py-8 text-gray-500">
                                    Aucune pratique enregistrée
                                  </td>
                                </tr>
                              ) : (
                                getStudentPracticeReports(student.id).slice(0, 10).map((report) => (
                                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                      <div className="font-medium">{format(report.practiceDate, 'dd/MM/yyyy')}</div>
                                      <div className="text-xs text-gray-500">
                                        Soumis le {format(report.submittedAt, 'dd/MM HH:mm')}
                                      </div>
                                    </td>
                                    <td className="py-3 px-4 font-medium">{report.duration} min</td>
                                    <td className="py-3 px-4">
                                      <span className="flex items-center gap-1">
                                        {report.location === 'home' ? (
                                          <>
                                            <Home className="w-3 h-3" />
                                            Maison
                                          </>
                                        ) : (
                                          <>
                                            <School className="w-3 h-3" />
                                            École
                                          </>
                                        )}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 max-w-xs">
                                      <div className="truncate" title={report.content}>
                                        {report.content}
                                      </div>
                                      {report.type === 'homework' && report.homeworkTitle && (
                                        <div className="text-xs text-blue-600 font-medium mt-1">
                                          📝 {report.homeworkTitle}
                                        </div>
                                      )}
                                    </td>
                                    <td className="py-3 px-4">
                                      <button
                                        onClick={() => setViewingPracticeDetail(viewingPracticeDetail === report.id ? null : report.id)}
                                        className="btn-outline text-xs flex items-center gap-1"
                                      >
                                        <Eye className="w-3 h-3" />
                                        Voir
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {getStudentPracticeReports(student.id).length > 10 && (
                          <div className="mt-4 text-sm text-gray-600 text-center">
                            Affichage des 10 pratiques les plus récentes sur {getStudentPracticeReports(student.id).length} au total
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de détail de pratique */}
      {viewingPracticeDetail && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="practice-detail-title"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {(() => {
                // Find the practice report across all students
                let practiceReport: any = null;
                let studentName = '';
                
                for (const student of students) {
                  const reports = getStudentPracticeReports(student.id);
                  const found = reports.find(r => r.id === viewingPracticeDetail);
                  if (found) {
                    practiceReport = found;
                    studentName = `${student.firstName} ${student.lastName}`;
                    break;
                  }
                }
                
                if (!practiceReport) return null;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 
                          id="practice-detail-title"
                          className="text-xl font-semibold text-gray-900"
                        >
                          Détails de la Pratique
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {studentName} - {format(practiceReport.practiceDate, 'dd MMMM yyyy')}
                        </p>
                      </div>
                      <button
                        onClick={() => setViewingPracticeDetail(null)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        aria-label="Fermer les détails de pratique"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 font-medium">Date de Pratique</div>
                        <div className="text-lg font-bold text-blue-900">
                          {format(practiceReport.practiceDate, 'dd/MM/yyyy')}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 font-medium">Durée</div>
                        <div className="text-lg font-bold text-green-900">{practiceReport.duration} minutes</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 font-medium">Lieu</div>
                        <div className="text-lg font-bold text-purple-900 flex items-center gap-2">
                          {practiceReport.location === 'home' ? (
                            <>
                              <Home className="w-4 h-4" />
                              Maison
                            </>
                          ) : (
                            <>
                              <School className="w-4 h-4" />
                              École
                            </>
                          )}
                        </div>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-4">
                        <div className="text-sm text-orange-600 font-medium">Date de Soumission</div>
                        <div className="text-lg font-bold text-orange-900">
                          {format(practiceReport.submittedAt, 'dd/MM HH:mm')}
                        </div>
                      </div>
                    </div>

                    {practiceReport.type === 'homework' && practiceReport.homeworkTitle && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center gap-2">
                          <Music className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">Exercice Assigné</span>
                        </div>
                        <p className="text-blue-800 mt-1">{practiceReport.homeworkTitle}</p>
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Music className="w-5 h-5 text-gray-600" />
                          Contenu de la Pratique
                        </h4>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {practiceReport.content}
                        </p>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                          Objectifs pour la Prochaine Pratique
                        </h4>
                        <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                          {practiceReport.nextGoals}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={() => setViewingPracticeDetail(null)}
                        className="btn-primary"
                      >
                        Fermer
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire de création d'exercice */}
      {showCreateForm && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assigner une Nouvelle Pratique</h3>
          <form onSubmit={handleCreateHomework} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre de la Pratique
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="input"
                placeholder="ex: Pratiquer la Gamme de Do Majeur, Apprendre 'Für Elise' Premier Mouvement"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Instructions de Pratique
              </label>
              <textarea
                id="description"
                name="description"
                className="textarea"
                rows={4}
                placeholder="Instructions détaillées de pratique, indications de tempo, techniques spécifiques à travailler..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="groupId" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigner au Groupe
                </label>
                <select
                  id="groupId"
                  name="groupId"
                  className="input"
                  defaultValue={selectedGroupId}
                  required
                >
                  <option value="">Sélectionner un groupe</option>
                  {teacherGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
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
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">
                Assigner la Pratique
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="btn-outline"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des exercices */}
      {filteredHomework.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {selectedGroupId ? 'Aucune pratique assignée à ce groupe pour le moment' : 'Aucun exercice de pratique pour le moment'}
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            Assigner Votre Première Pratique
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredHomework.map((hw) => {
            const stats = getHomeworkStats(hw);
            const group = groups.find(g => g.id === hw.groupId);

            return (
              <div key={hw.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hw.title}</h3>
                    <p className="text-gray-600 mb-3">{hw.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {group?.name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Échéance : {format(hw.dueDate, 'dd MMM yyyy')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {format(hw.dueDate, 'HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    stats.isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {stats.isOverdue ? 'En retard' : 'Actif'}
                  </div>
                </div>

                {/* Statistiques de soumission */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.submittedCount}</div>
                        <div className="text-sm text-gray-600">Soumis</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalStudents - stats.submittedCount}</div>
                        <div className="text-sm text-gray-600">En attente</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
                        <div className="text-sm text-gray-600">Total Élèves</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingSubmissions(viewingSubmissions === hw.id ? null : hw.id)}
                      className="btn-outline flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Voir les Soumissions
                    </button>
                  </div>

                  {/* Barre de progression */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progrès des Soumissions</span>
                      <span>{Math.round((stats.submittedCount / stats.totalStudents) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.submittedCount / stats.totalStudents) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Détail des soumissions */}
                {viewingSubmissions === hw.id && (
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Rapports de Pratique</h4>
                    {hw.submissions.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune soumission pour le moment</p>
                    ) : (
                      <div className="space-y-4">
                        {hw.submissions.map((submission: any) => {
                          const studentPicture = getStudentPicture(submission.studentId);
                          
                          return (
                            <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                    {studentPicture ? (
                                      <img
                                        src={studentPicture}
                                        alt="Photo de l'élève"
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{getStudentName(submission.studentId)}</p>
                                    <p className="text-sm text-gray-600">
                                      Soumis le {format(submission.submittedAt, 'dd MMM yyyy HH:mm')}
                                    </p>
                                  </div>
                                </div>
                                {submission.grade && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                                    {submission.grade}/100
                                  </span>
                                )}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                                <div className="bg-gray-50 rounded p-3">
                                  <strong>Date de pratique :</strong> {format(submission.practiceDate, 'dd MMM yyyy')}
                                </div>
                                <div className="bg-gray-50 rounded p-3">
                                  <strong>Durée :</strong> {submission.duration} minutes
                                </div>
                                <div className="bg-gray-50 rounded p-3 flex items-center gap-2">
                                  <strong>Lieu :</strong>
                                  {submission.location === 'home' ? (
                                    <span className="flex items-center gap-1">
                                      <Home className="w-3 h-3" />
                                      Maison
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1">
                                      <School className="w-3 h-3" />
                                      École
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div className="bg-gray-50 rounded p-3 text-sm">
                                  <strong>Contenu de la pratique :</strong>
                                  <p className="mt-1">{submission.content}</p>
                                </div>
                                
                                <div className="bg-blue-50 rounded p-3 text-sm">
                                  <strong>Objectifs pour la prochaine pratique :</strong>
                                  <p className="mt-1">{submission.nextGoals}</p>
                                </div>
                              </div>

                              {submission.feedback && (
                                <div className="mt-3 p-3 bg-yellow-50 rounded text-sm">
                                  <strong>Commentaire du Professeur :</strong> {submission.feedback}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}