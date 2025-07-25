import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import QRCodeSVG from 'react-qr-code';
import { Copy, Download, RefreshCw, Users, Calendar, Share2 } from 'lucide-react';

interface InvitationData {
  invitationId: string;
  code: string;
  teacherName: string;
  expiresAt: Date;
}

export default function InvitationManager() {
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateInvitation = async () => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const generateInvitationCode = httpsCallable(functions, 'generateInvitationCode');
      
      const result = await generateInvitationCode({});
      const data = result.data as InvitationData;
      
      setInvitation(data);
    } catch (error) {
      console.error('Erreur lors de la génération du code d\'invitation:', error);
      alert('Erreur lors de la génération du code d\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!invitation) return;
    
    try {
      await navigator.clipboard.writeText(invitation.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const shareInvitation = async () => {
    if (!invitation) return;
    
    const invitationUrl = `${window.location.origin}/join?code=${invitation.code}`;
    const shareText = `Rejoignez ma classe de musique ! Code d'invitation: ${invitation.code}\n\nLien: ${invitationUrl}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Invitation à rejoindre MusiqueConnect',
          text: shareText,
          url: invitationUrl
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API de partage
      await navigator.clipboard.writeText(shareText);
      alert('Informations d\'invitation copiées dans le presse-papiers !');
    }
  };

  const downloadQRCode = () => {
    if (!invitation) return;
    
    const svg = document.querySelector('#qr-code svg') as SVGElement;
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `invitation-${invitation.code}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Invitations</h2>
        <p className="text-gray-600">
          Générez des codes d'invitation pour que vos élèves puissent rejoindre votre classe.
        </p>
      </div>

      {!invitation ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucun code d'invitation actif
          </h3>
          <p className="text-gray-600 mb-6">
            Créez un nouveau code d'invitation pour permettre à vos élèves de rejoindre votre classe.
          </p>
          <button
            onClick={generateInvitation}
            disabled={loading}
            className="btn-primary flex items-center gap-2 mx-auto"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            {loading ? 'Génération...' : 'Générer un Code d\'Invitation'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Code d'Invitation Actif
              </h3>
              <p className="text-gray-600">
                Partagez ce code avec vos élèves pour qu'ils rejoignent votre classe
              </p>
            </div>
            <button
              onClick={generateInvitation}
              disabled={loading}
              className="btn-outline flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Nouveau Code
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Code d'invitation */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code d'Invitation
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <span className="text-3xl font-mono font-bold text-primary-600 tracking-wider">
                      {invitation.code}
                    </span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Instructions pour vos élèves :</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Allez sur <strong>musiqueconnect.app/join</strong></li>
                  <li>2. Entrez le code : <strong>{invitation.code}</strong></li>
                  <li>3. Créez leur compte avec leur email</li>
                  <li>4. Ils seront automatiquement ajoutés à votre classe</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={shareInvitation}
                  className="btn-primary flex items-center gap-2 flex-1"
                >
                  <Share2 className="w-4 h-4" />
                  Partager l'Invitation
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code
                </label>
                <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-center">
                  <div id="qr-code">
                    <QRCodeSVG
                      value={`${window.location.origin}/join?code=${invitation.code}`}
                      size={200}
                      level="M"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="btn-outline flex items-center gap-2 flex-1"
                >
                  <Download className="w-4 h-4" />
                  Télécharger QR Code
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Expire le</span>
                </div>
                <p className="font-medium text-gray-900">
                  {invitation.expiresAt.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 