import React, { useState, useEffect } from 'react';
import { Users, Edit, Trash2, UserPlus, User, Search, Mail, Music2, Calendar, BookOpen, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';

interface StudentManagerProps {
  selectedGroupId?: string;
}

export default function StudentManager({ selectedGroupId }: StudentManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStudent, setEditingStudent] = useState<string | null>(null);

  const { user } = useAuth();
  const { groups, users, getStudentsByGroup, getActiveGroups, addUser, addStudentToGroup } = useData();

  // Utiliser la fonction getActiveGroups pour filtrer les groupes
  const teacherGroups = getActiveGroups(user?.id || '');
  const allStudents = users.filter(u => u.role === 'student');
  
  // Filter students based on selected group or show all
  const displayStudents = selectedGroupId 
    ? getStudentsByGroup(selectedGroupId)
    : allStudents.filter(student => 
        teacherGroups.some(group => group.studentIds.includes(student.id))
      );

  // Filter by search term
  const filteredStudents = displayStudents.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.instrument && student.instrument.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort students automatically by last name when group is selected
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aLastName = a.lastName || '';
    const bLastName = b.lastName || '';
    return aLastName.localeCompare(bLastName);
  });

  const getStudentGroups = (studentId: string) => {
    return teacherGroups.filter(group => group.studentIds.includes(studentId));
  };

  const getStudentStats = (studentId: string) => {
    // In a real app, this would calculate actual stats
    return {
      homeworkCompleted: Math.floor(Math.random() * 10),
      homeworkTotal: Math.floor(Math.random() * 15) + 5,
      averageGrade: Math.floor(Math.random() * 30) + 70
    };
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-transparent">
        {selectedGroupId && (
          <h2 className="text-2xl font-bold text-gray-900">
            Élèves - Groupe {groups.find(g => g.id === selectedGroupId)?.name}
          </h2>
        )}
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, email ou instrument..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Tableau des élèves */}
      {sortedStudents.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Aucun élève trouvé avec ces critères de recherche'
              : selectedGroupId 
                ? 'Aucun élève dans ce groupe pour le moment'
                : 'Aucun élève inscrit pour le moment'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Élève
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groupe(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statistiques
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedStudents.map((student) => {
                  const studentGroups = getStudentGroups(student.id);
                  const stats = getStudentStats(student.id);
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      {/* Colonne Élève */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {student.picture ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={student.picture}
                                alt={`${student.firstName} ${student.lastName}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Colonne Email */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <a 
                            href={`mailto:${student.email}`}
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </a>
                        </div>
                      </td>

                      {/* Colonne Instrument */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Music2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {student.instrument || 'Non spécifié'}
                          </span>
                        </div>
                      </td>

                      {/* Colonne Groupes */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {studentGroups.length > 0 ? (
                            studentGroups.map(group => (
                              <span
                                key={group.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {group.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">Aucun groupe</span>
                          )}
                        </div>
                      </td>

                      {/* Colonne Statistiques */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-500">Pratiques</div>
                            <div className="text-sm font-bold text-blue-600">
                              {stats.homeworkCompleted}/{stats.homeworkTotal}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-medium text-gray-500">Note</div>
                            <div className="text-sm font-bold text-green-600">
                              {stats.averageGrade}%
                            </div>
                          </div>
                        </div>
                      </td>

                      

                      {/* Colonne Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingStudent(student.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Voir profil"
                          >
                            <User className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Résumé des élèves */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Résumé des Élèves
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{sortedStudents.length}</div>
            <div className="text-sm text-gray-600">
              {selectedGroupId ? 'Élèves dans ce groupe' : 'Total Élèves'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {sortedStudents.filter(s => s.instrument === 'Piano').length}
            </div>
            <div className="text-sm text-gray-600">Pianistes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {sortedStudents.filter(s => s.instrument === 'Guitare').length}
            </div>
            <div className="text-sm text-gray-600">Guitaristes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {sortedStudents.filter(s => s.instrument === 'Violon').length}
            </div>
            <div className="text-sm text-gray-600">Violonistes</div>
          </div>
        </div>
      </div>
    </div>
  );
}