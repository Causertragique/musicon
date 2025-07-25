import { 
  userService, 
  groupService, 
  homeworkService, 
  messageService, 
  announcementService, 
  purchaseService 
} from '../services/firebaseService';

// Données de test pour initialiser Firebase
const initialUsers = [
  {
    firstName: 'Sarah',
    lastName: 'Dubois',
    email: 'teacher@demo.com',
    role: 'teacher' as const
  },
  {
    firstName: 'Emma',
    lastName: 'Martin',
    email: 'student1@demo.com',
    role: 'student' as const,
    instrument: 'Piano',
    picture: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    firstName: 'Lucas',
    lastName: 'Moreau',
    email: 'student2@demo.com',
    role: 'student' as const,
    instrument: 'Guitare',
    picture: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  },
  {
    firstName: 'Sofia',
    lastName: 'Rodriguez',
    email: 'student3@demo.com',
    role: 'student' as const,
    instrument: 'Violon',
    picture: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
  }
];

const initialGroups = [
  {
    name: '118',
    description: 'Groupe de musique 118',
    teacherId: '', // Sera rempli après création de l'utilisateur
    studentIds: []
  },
  {
    name: '119',
    description: 'Groupe de musique 119',
    teacherId: '', // Sera rempli après création de l'utilisateur
    studentIds: []
  },
  {
    name: '218',
    description: 'Groupe de musique 218',
    teacherId: '', // Sera rempli après création de l'utilisateur
    studentIds: []
  }
];

const initialHomework = [
  {
    title: 'Pratiquer la Gamme de Do Majeur',
    description: 'Pratiquez la gamme de Do majeur avec les deux mains. Concentrez-vous sur le bon positionnement des doigts (1-2-3-1-2-3-4-5). Jouez lentement au début, puis augmentez progressivement le tempo.',
    dueDate: new Date('2024-12-25'),
    groupId: '', // Sera rempli après création des groupes
    teacherId: '' // Sera rempli après création de l'utilisateur
  },
  {
    title: 'Apprendre la Progression d\'Accords de "Wonderwall"',
    description: 'Maîtrisez la progression d\'accords de "Wonderwall" d\'Oasis (Em7-G-D-C-Am-C-D). Pratiquez les transitions fluides entre les accords.',
    dueDate: new Date('2024-12-28'),
    groupId: '', // Sera rempli après création des groupes
    teacherId: '' // Sera rempli après création de l'utilisateur
  },
  {
    title: 'Exercices de Vibrato au Violon',
    description: 'Travaillez les exercices de vibrato sur les cordes à vide, puis appliquez-les sur la gamme de Sol majeur. Concentrez-vous sur la régularité du mouvement.',
    dueDate: new Date('2024-12-30'),
    groupId: '', // Sera rempli après création des groupes
    teacherId: '' // Sera rempli après création de l'utilisateur
  }
];

const initialMessages = [
  {
    senderId: '', // Sera rempli après création de l'utilisateur
    groupId: '', // Sera rempli après création des groupes
    content: 'Excellent progrès tout le monde ! N\'oubliez pas de pratiquer vos gammes quotidiennement.',
    type: 'group' as const
  },
  {
    senderId: '', // Sera rempli après création de l'utilisateur
    groupId: '', // Sera rempli après création des groupes
    content: 'Rappel : cours annulé demain en raison de la fête de la musique.',
    type: 'announcement' as const
  }
];

const initialAnnouncements = [
  {
    title: 'Cours annulé - Fête de la Musique',
    content: 'En raison de la fête de la musique, le cours de demain est annulé. Profitez bien de cette journée musicale !',
    teacherId: '', // Sera rempli après création de l'utilisateur
    groupId: '', // Sera rempli après création des groupes
    priority: 'high' as const
  },
  {
    title: 'Nouveau matériel disponible',
    content: 'De nouvelles partitions et méthodes sont disponibles à la bibliothèque. N\'hésitez pas à les consulter !',
    teacherId: '', // Sera rempli après création de l'utilisateur
    groupId: '', // Sera rempli après création des groupes
    priority: 'medium' as const
  }
];

const initialPurchases = [
  {
    studentId: '', // Sera rempli après création des utilisateurs
    studentName: 'Emma Martin',
    groupId: '', // Sera rempli après création des groupes
    groupName: '118',
    item: 'Méthode de Piano - Niveau 1',
    amount: 25.00,
    status: 'paid' as const,
    teacherId: '' // Sera rempli après création de l'utilisateur
  },
  {
    studentId: '', // Sera rempli après création des utilisateurs
    studentName: 'Lucas Moreau',
    groupId: '', // Sera rempli après création des groupes
    groupName: '119',
    item: 'Cordes de Guitare - Pack 3',
    amount: 15.50,
    status: 'credit' as const,
    teacherId: '' // Sera rempli après création de l'utilisateur
  }
];

export async function initializeFirebaseData() {
  try {
    console.log('🚀 Initialisation des données Firebase...');

    // 1. Créer les utilisateurs
    console.log('📝 Création des utilisateurs...');
    const userIds: string[] = [];
    for (const userData of initialUsers) {
      const userId = await userService.create(userData);
      userIds.push(userId);
      console.log(`✅ Utilisateur créé: ${userData.firstName} ${userData.lastName} (${userId})`);
    }

    const teacherId = userIds[0]; // Premier utilisateur = professeur
    const studentIds = userIds.slice(1); // Reste = étudiants

    // 2. Créer les groupes
    console.log('👥 Création des groupes...');
    const groupIds: string[] = [];
    for (const groupData of initialGroups) {
      const groupId = await groupService.create({
        ...groupData,
        teacherId
      });
      groupIds.push(groupId);
      console.log(`✅ Groupe créé: ${groupData.name} (${groupId})`);
    }

    // 3. Assigner les étudiants aux groupes
    console.log('🔗 Attribution des étudiants aux groupes...');
    for (let i = 0; i < studentIds.length && i < groupIds.length; i++) {
      await groupService.addStudentToGroup(groupIds[i], studentIds[i]);
      console.log(`✅ Étudiant ${i + 1} assigné au groupe ${initialGroups[i].name}`);
    }

    // 4. Créer les devoirs
    console.log('📚 Création des devoirs...');
    for (let i = 0; i < initialHomework.length && i < groupIds.length; i++) {
      await homeworkService.create({
        ...initialHomework[i],
        groupId: groupIds[i],
        teacherId
      });
      console.log(`✅ Devoir créé: ${initialHomework[i].title}`);
    }

    // 5. Créer les messages
    console.log('💬 Création des messages...');
    for (let i = 0; i < initialMessages.length && i < groupIds.length; i++) {
      await messageService.create({
        ...initialMessages[i],
        senderId: teacherId,
        groupId: groupIds[i]
      });
      console.log(`✅ Message créé: ${initialMessages[i].content.substring(0, 50)}...`);
    }

    // 6. Créer les annonces
    console.log('📢 Création des annonces...');
    for (let i = 0; i < initialAnnouncements.length && i < groupIds.length; i++) {
      await announcementService.create({
        ...initialAnnouncements[i],
        teacherId,
        groupId: groupIds[i]
      });
      console.log(`✅ Annonce créée: ${initialAnnouncements[i].title}`);
    }

    // 7. Créer les achats
    console.log('💰 Création des achats...');
    for (let i = 0; i < initialPurchases.length && i < studentIds.length; i++) {
      await purchaseService.create({
        ...initialPurchases[i],
        studentId: studentIds[i],
        groupId: groupIds[i],
        teacherId
      });
      console.log(`✅ Achat créé: ${initialPurchases[i].item}`);
    }

    console.log('🎉 Initialisation Firebase terminée avec succès !');
    console.log('📊 Résumé:');
    console.log(`   - ${userIds.length} utilisateurs créés`);
    console.log(`   - ${groupIds.length} groupes créés`);
    console.log(`   - ${initialHomework.length} devoirs créés`);
    console.log(`   - ${initialMessages.length} messages créés`);
    console.log(`   - ${initialAnnouncements.length} annonces créées`);
    console.log(`   - ${initialPurchases.length} achats créés`);

    return {
      userIds,
      groupIds,
      success: true
    };

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation Firebase:', error);
    throw error;
  }
}

// Fonction pour vérifier si les données existent déjà
export async function checkFirebaseData() {
  try {
    const users = await userService.getAll();
    const groups = await groupService.getAll();
    
    return {
      hasUsers: users.length > 0,
      hasGroups: groups.length > 0,
      userCount: users.length,
      groupCount: groups.length
    };
  } catch (error) {
    console.error('Erreur lors de la vérification des données:', error);
    return {
      hasUsers: false,
      hasGroups: false,
      userCount: 0,
      groupCount: 0
    };
  }
} 