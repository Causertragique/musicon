import { getFunctions, httpsCallable } from 'firebase/functions';
import { User } from '../types';
import { userService } from './firebaseService';

interface CreateUserResult {
  user: User;
  tempPassword: string;
}

/**
 * Creates a new user account via a Cloud Function and then saves the user data to Firestore.
 * @param userData - The user data for the new user, without the 'id'.
 * @returns The newly created user object with their ID and temporary password.
 */
export const addUser = async (userData: Omit<User, 'id'>): Promise<CreateUserResult> => {
  try {
    const functions = getFunctions();
    const createUserCallable = httpsCallable(functions, 'createUserAccount');
    
    // Call the cloud function to create the user in Firebase Auth
    const result = await createUserCallable({
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
    });

    const response = result.data as { uid: string; tempPassword: string };

    if (!response.uid) {
        throw new Error("La fonction Cloud n'a pas retourné de UID.");
    }

    // Prepare the full user object to be saved in Firestore
    const newUser: User = {
      ...userData,
      id: response.uid,
    };

    // Save the new user document in Firestore with the UID as the document ID
    await userService.createWithId(response.uid, newUser);
    
    return {
      user: newUser,
      tempPassword: response.tempPassword
    };
  } catch (error) {
    console.error("Erreur détaillée lors de la création de l'utilisateur:", error);
    // It might be useful to check for specific Firebase error codes here
    throw new Error("Une erreur est survenue lors de la création du compte utilisateur.");
  }
}; 