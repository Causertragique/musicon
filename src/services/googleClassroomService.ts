// Service d'intégration Google Classroom
import { auth } from '../config/firebase';

// Interfaces pour Google Classroom
export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section: string;
  descriptionHeading: string;
  description: string;
  room: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode: string;
  courseState: string;
  alternateLink: string;
  teacherGroupEmail: string;
  courseGroupEmail: string;
  guardiansEnabled: boolean;
  calendarId: string;
}

export interface GoogleClassroomStudent {
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    permissions: Array<{
      permission: string;
    }>;
    photoUrl: string;
    verifiedTeacher: boolean;
  };
  courseId: string;
}

export interface GoogleClassroomCourseWork {
  id: string;
  title: string;
  description: string;
  materials: Array<{
    driveFile?: {
      driveFile: {
        id: string;
        title: string;
        alternateLink: string;
      };
      shareMode: string;
    };
    form?: {
      formUrl: string;
      responseUrl: string;
      title: string;
      thumbnailUrl: string;
    };
    link?: {
      url: string;
      title: string;
      thumbnailUrl: string;
    };
  }>;
  state: string;
  alternateLink: string;
  courseId: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
    seconds: number;
    nanos: number;
  };
  maxPoints?: number;
  workType: string;
  assigneeMode: string;
  individualStudentsOptions?: {
    studentIds: string[];
  };
  submissionModificationMode: string;
  creatorUserId: string;
  topicId?: string;
  gradeCategory?: {
    id: string;
    name: string;
    weight: number;
  };
}

export class GoogleClassroomService {
  private static instance: GoogleClassroomService;
  private baseUrl = 'https://classroom.googleapis.com/v1';

  public static getInstance(): GoogleClassroomService {
    if (!GoogleClassroomService.instance) {
      GoogleClassroomService.instance = new GoogleClassroomService();
    }
    return GoogleClassroomService.instance;
  }

  /**
   * Récupère la liste des cours Google Classroom
   */
  public async getCourses(): Promise<GoogleClassroomCourse[]> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/courses?pageSize=20`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Classroom: ${response.status}`);
      }

      const data = await response.json();
      return data.courses || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des cours:', error);
      throw error;
    }
  }

  /**
   * Récupère les élèves d'un cours spécifique
   */
  public async getStudents(courseId: string): Promise<GoogleClassroomStudent[]> {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(`${this.baseUrl}/courses/${courseId}/students`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Classroom: ${response.status}`);
      }

      const data = await response.json();
      return data.students || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des élèves:', error);
      throw error;
    }
  }

  /**
   * Crée un nouveau devoir dans Google Classroom
   */
  public async createCourseWork(
    courseId: string,
    title: string,
    description: string,
    materials: any[] = []
  ): Promise<GoogleClassroomCourseWork> {
    try {
      const accessToken = await this.getAccessToken();
      const courseWork = {
        title,
        description,
        materials,
        state: 'PUBLISHED',
        workType: 'ASSIGNMENT',
        assigneeMode: 'ALL_STUDENTS',
        submissionModificationMode: 'MODIFIABLE_UNTIL_TURNED_IN',
      };

      const response = await fetch(`${this.baseUrl}/courses/${courseId}/courseWork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseWork),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Classroom: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de la création du devoir:', error);
      throw error;
    }
  }

  /**
   * Ajoute du matériel pédagogique à un cours
   */
  public async addCourseMaterial(
    courseId: string,
    title: string,
    materials: any[]
  ): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const courseMaterial = {
        title,
        materials,
      };

      const response = await fetch(`${this.baseUrl}/courses/${courseId}/courseWorkMaterials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseMaterial),
      });

      if (!response.ok) {
        throw new Error(`Erreur API Google Classroom: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du matériel:', error);
      throw error;
    }
  }

  /**
   * Synchronise les cours avec MusiqueConnect
   */
  public async syncCoursesWithMusiqueConnect(): Promise<void> {
    try {
      const courses = await this.getCourses();
      
      for (const course of courses) {
        // Récupérer les élèves du cours
        const students = await this.getStudents(course.id);
        
        // Créer ou mettre à jour le groupe dans MusiqueConnect
        await this.createOrUpdateGroup(course, students);
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      throw error;
    }
  }

  /**
   * Crée ou met à jour un groupe dans MusiqueConnect
   */
  private async createOrUpdateGroup(
    course: GoogleClassroomCourse,
    students: GoogleClassroomStudent[]
  ): Promise<void> {
    // Cette fonction sera implémentée pour synchroniser avec la base de données MusiqueConnect
    console.log('Synchronisation du cours:', course.name);
    console.log('Nombre d\'élèves:', students.length);
    
    // TODO: Implémenter la synchronisation avec la base de données Firebase
  }

  /**
   * Récupère le token d'accès Google depuis le localStorage
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Vérifier si l'utilisateur est connecté via Firebase
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Utilisateur non connecté. Veuillez vous connecter avec Google.');
      }

      // Récupérer le token depuis le localStorage (stocké par le service GoogleAuth)
      const accessToken = localStorage.getItem('google_access_token');
      const tokenExpiry = localStorage.getItem('google_token_expiry');

      if (!accessToken) {
        // Nettoyer les tokens expirés et forcer une nouvelle authentification
        this.clearExpiredTokens();
        throw new Error('Token Google non trouvé. Veuillez vous reconnecter.');
      }

      // Vérifier si le token a expiré
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        // Essayer de rafraîchir le token
        const refreshToken = localStorage.getItem('google_refresh_token');
        if (refreshToken) {
          console.log('Rafraîchissement du token Google...');
          try {
            const newToken = await this.refreshToken(refreshToken);
            return newToken;
          } catch (refreshError) {
            console.log('Échec du rafraîchissement, nettoyage des tokens...');
            this.clearExpiredTokens();
            throw new Error('Token expiré et rafraîchissement impossible. Veuillez vous reconnecter.');
          }
        } else {
          this.clearExpiredTokens();
          throw new Error('Token expiré et aucun refresh token disponible.');
        }
      }

      console.log('Token Google récupéré avec succès');
      return accessToken;
    } catch (error) {
      console.error('Erreur lors de la récupération du token Google:', error);
      throw new Error('Authentification Google requise. Veuillez vous reconnecter.');
    }
  }

  /**
   * Nettoie les tokens expirés du localStorage
   */
  private clearExpiredTokens(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_token_expiry');
    console.log('Tokens Google expirés nettoyés');
  }

  /**
   * Rafraîchit le token d'accès Google
   */
  private async refreshToken(refreshToken: string): Promise<string> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
          client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du rafraîchissement du token');
      }

      const data = await response.json();
      
      // Mettre à jour le token dans le localStorage
      localStorage.setItem('google_access_token', data.access_token);
      localStorage.setItem('google_token_expiry', (Date.now() + data.expires_in * 1000).toString());

      return data.access_token;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      throw new Error('Impossible de rafraîchir le token Google.');
    }
  }
}

export default GoogleClassroomService.getInstance(); 