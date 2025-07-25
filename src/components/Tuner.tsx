import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface TunerSettings {
  referencePitch: number; // Fréquence de référence (A4 = 440Hz par défaut)
  tolerance: number; // Tolérance en cents
  instrument: string;
  autoDetect: boolean;
  volume: number;
}

interface Note {
  name: string;
  frequency: number;
  octave: number;
}

export default function Tuner() {
  const [settings, setSettings] = useState<TunerSettings>({
    referencePitch: 440,
    tolerance: 10,
    instrument: 'auto',
    autoDetect: true,
    volume: 0.8
  });

  const [isListening, setIsListening] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [cents, setCents] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [confidence, setConfidence] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>();

  // Notes de référence (A4 = 440Hz)
  const notes = [
    { name: 'Do', frequency: 261.63, octave: 4 },
    { name: 'Do#', frequency: 277.18, octave: 4 },
    { name: 'Ré', frequency: 293.66, octave: 4 },
    { name: 'Ré#', frequency: 311.13, octave: 4 },
    { name: 'Mi', frequency: 329.63, octave: 4 },
    { name: 'Fa', frequency: 349.23, octave: 4 },
    { name: 'Fa#', frequency: 369.99, octave: 4 },
    { name: 'Sol', frequency: 392.00, octave: 4 },
    { name: 'Sol#', frequency: 415.30, octave: 4 },
    { name: 'La', frequency: 440.00, octave: 4 },
    { name: 'La#', frequency: 466.16, octave: 4 },
    { name: 'Si', frequency: 493.88, octave: 4 },
  ];

  // Instruments prédéfinis
  const instruments = [
    { name: 'Auto', value: 'auto', range: 'Toutes les fréquences' },
    { name: 'Clarinette', value: 'clarinet', range: 'E3 - G6' },
    { name: 'Flûte', value: 'flute', range: 'C4 - C7' },
    { name: 'Saxophone', value: 'saxophone', range: 'Bb2 - F#5' },
    { name: 'Trompette', value: 'trumpet', range: 'F#3 - C6' },
    { name: 'Violon', value: 'violin', range: 'G3 - A7' },
    { name: 'Guitare', value: 'guitar', range: 'E2 - E6' },
    { name: 'Piano', value: 'piano', range: 'A0 - C8' },
  ];

  // Calculer la note la plus proche
  const findClosestNote = (freq: number): { note: Note; cents: number } => {
    if (freq === 0) return { note: notes[9], cents: 0 }; // A4 par défaut

    // Calculer l'octave et la note
    const a4 = settings.referencePitch;
    const c0 = a4 * Math.pow(2, -4.75);
    const halfStepsBelowMiddleC = Math.round(12 * Math.log2(freq / c0));
    const octave = Math.floor(halfStepsBelowMiddleC / 12);
    const noteIndex = (halfStepsBelowMiddleC % 12 + 12) % 12;
    
    const note = {
      name: notes[noteIndex].name,
      frequency: notes[noteIndex].frequency * Math.pow(2, octave - 4),
      octave: octave
    };

    // Calculer les cents
    const cents = Math.round(1200 * Math.log2(freq / note.frequency));
    
    return { note, cents };
  };

  // Démarrer l'écoute
  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 2048; // Retour à 2048 pour plus de réactivité
      analyserRef.current.smoothingTimeConstant = 0.5; // Lissage modéré
      
      microphoneRef.current.connect(analyserRef.current);
      
      setIsListening(true);
      detectPitch();
    } catch (error) {
      console.error('Erreur d\'accès au microphone:', error);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  // Arrêter l'écoute
  const stopListening = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    setIsListening(false);
    setCurrentNote(null);
    setCents(0);
    setFrequency(0);
    setConfidence(0);
  };

  // Détecter la hauteur
  const detectPitch = () => {
    if (!analyserRef.current || !isListening) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatFrequencyData(dataArray);

    // Trouver la fréquence dominante
    let maxIndex = 0;
    let maxValue = -Infinity;
    
    // Chercher dans une plage de fréquences plus large
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }

    // Convertir l'index en fréquence
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const freq = (maxIndex * sampleRate) / (analyserRef.current.fftSize * 2);

    // Debug: afficher les valeurs brutes
    console.log('Fréquence détectée:', freq, 'Amplitude:', maxValue, 'Index:', maxIndex);

    // Plage de fréquences plus large et seuil plus permissif
    if (freq > 50 && freq < 3000 && maxValue > -80) {
      setFrequency(freq);
      
      const { note, cents } = findClosestNote(freq);
      setCurrentNote(note);
      setCents(cents);
      
      // Calculer la confiance
      const confidence = Math.max(0, Math.min(100, (maxValue + 140) * 2));
      setConfidence(confidence);
      
      console.log('Note détectée:', note.name, note.octave, 'Cents:', cents);
    } else {
      // Garder les valeurs précédentes si pas de nouveau signal
      if (maxValue <= -80) {
        setFrequency(0);
        setCurrentNote(null);
        setCents(0);
        setConfidence(0);
        console.log('Pas de signal valide détecté');
      }
    }

    animationRef.current = requestAnimationFrame(detectPitch);
  };

  // Générer un son de référence
  const playReferenceTone = (note: Note) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(note.frequency, audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(settings.volume, audioContextRef.current.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 5);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 5);
  };

  // Nettoyer à la fermeture
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Accordeur Principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Accordeur</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Colonne gauche - Affichage principal */}
            <div className="space-y-8 flex flex-col items-center">
              {/* Affichage de la note */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-8xl font-bold text-gray-900 mb-6">
                  {currentNote ? `${currentNote.name}${currentNote.octave}` : '--'}
                </div>
                
                {/* Indicateur de justesse */}
                <div className="w-64 h-8 bg-gray-200 rounded-full mb-4 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                  </div>
                  <div 
                    className={`absolute top-1 h-6 rounded-full transition-all duration-200 ${
                      Math.abs(cents) <= settings.tolerance 
                        ? 'bg-green-500' 
                        : cents > 0 
                          ? 'bg-red-500' 
                          : 'bg-blue-500'
                    }`}
                    style={{
                      left: `${50 + (cents / 50) * 25}%`,
                      width: '4px',
                      transform: 'translateX(-50%)'
                    }}
                  ></div>
                </div>
                
                {/* Affichage des cents */}
                <div className="text-2xl font-medium text-gray-700 mb-2">
                  {cents > 0 ? `+${cents}` : cents < 0 ? cents : 0} cents
                </div>
                
                {/* Fréquence */}
                <div className="text-lg text-gray-500">
                  {frequency > 0 ? `${frequency.toFixed(1)} Hz` : '-- Hz'}
                </div>
              </div>

              {/* Bouton principal */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl transition-all duration-200 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 shadow-xl' 
                    : 'bg-[#1473AA] hover:bg-blue-700 shadow-xl'
                }`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>

              {/* Indicateur de confiance */}
              {isListening && (
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Confiance</span>
                    <span>{Math.round(confidence)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#1473AA] h-2 rounded-full transition-all duration-200"
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Colonne droite - Contrôles */}
            <div className="space-y-6">
              {/* Réglages de base */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900">Réglages</h4>
                
                {/* Fréquence de référence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fréquence de référence (A4)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="430"
                      max="450"
                      step="1"
                      value={settings.referencePitch}
                      onChange={(e) => setSettings(prev => ({ ...prev, referencePitch: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 w-12">
                      {settings.referencePitch} Hz
                    </span>
                  </div>
                </div>

                {/* Tolérance */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tolérance (± cents)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="5"
                      max="25"
                      step="5"
                      value={settings.tolerance}
                      onChange={(e) => setSettings(prev => ({ ...prev, tolerance: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-700 w-12">
                      ±{settings.tolerance}
                    </span>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volume
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.volume}
                    onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Instrument */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Instrument
                </label>
                <select
                  value={settings.instrument}
                  onChange={(e) => setSettings(prev => ({ ...prev, instrument: e.target.value }))}
                  className="w-full p-3 rounded-lg border border-[#1473AA] text-lg focus:ring-2 focus:ring-[#1473AA] focus:border-[#1473AA]"
                >
                  {instruments.map((instrument) => (
                    <option key={instrument.value} value={instrument.value}>
                      {instrument.name} ({instrument.range})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes de référence */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Notes de référence</h4>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => playReferenceTone({ name: 'La', frequency: 440.00, octave: 4 })}
                    className="p-3 rounded-lg border border-gray-300 hover:bg-yellow-50 transition-colors text-center"
                  >
                    <div className="text-lg font-medium text-gray-900">La</div>
                    <div className="text-sm text-gray-500">440.0 Hz</div>
                  </button>
                  
                  {[
                    { name: 'Si♭', frequency: 233.08, octave: 3 },
                    { name: 'Ré', frequency: 293.66, octave: 4 },
                    { name: 'Fa', frequency: 349.23, octave: 4 }
                  ].map((note) => (
                    <button
                      key={note.name}
                      onClick={() => playReferenceTone(note)}
                      className="p-3 rounded-lg border border-gray-300 hover:bg-blue-50 transition-colors text-center"
                    >
                      <div className="text-lg font-medium text-gray-900">{note.name}</div>
                      <div className="text-sm text-gray-500">{note.frequency.toFixed(1)} Hz</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 