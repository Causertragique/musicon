import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Minus, 
  Settings,
  Music,
  Square,
  Bell,
  Zap,
  Star,
  Target
} from 'lucide-react';

interface MetronomeSettings {
  bpm: number;
  timeSignature: [number, number];
  sound: 'click' | 'woodblock' | 'bell' | 'electronic' | 'drum';
  volume: number;
  accent: boolean;
  visualFlash: boolean;
  pattern: number[];
  rhythmPattern: string;
}

export default function Metronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [beatCount, setBeatCount] = useState(0);
  const [settings, setSettings] = useState<MetronomeSettings>({
    bpm: 120,
    timeSignature: [4, 4],
    sound: 'click',
    volume: 0.9,
    accent: true,
    visualFlash: true,
    pattern: [1, 0, 0, 0],
    rhythmPattern: '♩'
  });
  
  const [showSettings, setShowSettings] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<number | null>(null);
  const nextBeatTimeRef = useRef<number>(0);

  // Initialiser l'AudioContext
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Générer les sons
  const generateSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
    oscillator.type = type;
    
    // Volume plus élevé pour être audible par-dessus les instruments
    const baseVolume = settings.volume * 0.6; // Volume de base plus élevé
    
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(baseVolume, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration);
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  // Jouer le son selon le type
  const playSound = (isAccent: boolean = false) => {
    if (!settings.accent) {
      // Si les accents sont désactivés, jouer le même son pour tous les temps
      switch (settings.sound) {
        case 'click':
          generateSound(600, 0.1, 'square');
          break;
        case 'woodblock':
          generateSound(300, 0.15, 'triangle');
          break;
        case 'bell':
          generateSound(800, 0.3, 'sine');
          break;
        case 'electronic':
          generateSound(700, 0.08, 'sawtooth');
          break;
        case 'drum':
          generateSound(150, 0.2, 'triangle');
          break;
      }
      return;
    }

    // BIP (premier temps) vs BOP (autres temps) - distinction claire
    switch (settings.sound) {
      case 'click':
        if (isAccent) {
          generateSound(1000, 0.2, 'square'); // BIP : aigu et long
        } else {
          generateSound(400, 0.08, 'sine'); // BOP : grave et court
        }
        break;
      case 'woodblock':
        if (isAccent) {
          generateSound(600, 0.25, 'triangle'); // BIP : moyen et long
        } else {
          generateSound(200, 0.1, 'sine'); // BOP : grave et court
        }
        break;
      case 'bell':
        if (isAccent) {
          generateSound(1200, 0.5, 'sine'); // BIP : aigu et très long
        } else {
          generateSound(600, 0.15, 'sine'); // BOP : moyen et court
        }
        break;
      case 'electronic':
        if (isAccent) {
          generateSound(900, 0.15, 'square'); // BIP : aigu et moyen
        } else {
          generateSound(500, 0.06, 'sawtooth'); // BOP : grave et très court
        }
        break;
      case 'drum':
        if (isAccent) {
          generateSound(300, 0.3, 'sine'); // BIP : grave et long
        } else {
          generateSound(100, 0.15, 'triangle'); // BOP : très grave et court
        }
        break;
    }
  };

  // Fonction principale du métronome
  const scheduleBeat = () => {
    if (!audioContextRef.current) return;

    const beatInterval = 60 / settings.bpm;
    
    while (nextBeatTimeRef.current < audioContextRef.current.currentTime + 0.05) {
      const beatInMeasure = Math.floor((nextBeatTimeRef.current - audioContextRef.current.currentTime) / beatInterval) % settings.timeSignature[0];
      const isAccent = settings.pattern[beatInMeasure] === 1;
      
      // Mettre à jour l'indicateur visuel avant de jouer le son
      if (settings.visualFlash) {
        setBeatCount(prev => {
          const newCount = prev + 1;
          const beatInMeasure = (newCount - 1) % settings.timeSignature[0]; // -1 pour commencer à 0
          setCurrentBeat(beatInMeasure);
          return newCount;
        });
      }
      
      playSound(isAccent);
      
      nextBeatTimeRef.current += beatInterval;
    }
  };

  // Démarrer/Arrêter le métronome
  const toggleMetronome = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setCurrentBeat(-1);
      setBeatCount(0);
    } else {
      setIsPlaying(true);
      if (audioContextRef.current) {
        audioContextRef.current.resume();
        
        // Démarrer immédiatement avec le premier temps
        if (settings.visualFlash) {
          setCurrentBeat(0);
          setBeatCount(1); // Commencer à 1 pour que le deuxième temps soit correct
        }
        
        // Jouer le premier son immédiatement
        const isAccent = settings.pattern[0] === 1;
        playSound(isAccent);
        
        // Programmer le prochain temps après l'intervalle correct
        const beatInterval = 60 / settings.bpm;
        nextBeatTimeRef.current = audioContextRef.current.currentTime + beatInterval;
      }
      intervalRef.current = setInterval(scheduleBeat, 5);
    }
  };

  // Tempo tap
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const handleTapTempo = () => {
    const now = Date.now();
    const newTapTimes = [...tapTimes, now].slice(-4);
    setTapTimes(newTapTimes);
    
    if (newTapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }
      const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const newBpm = Math.round(60000 / averageInterval);
      setSettings(prev => ({ ...prev, bpm: Math.max(40, Math.min(200, newBpm)) }));
    }
  };

  // Patterns prédéfinis
  const presetPatterns = [
    { name: '4/4', pattern: [1, 0, 0, 0], timeSignature: [4, 4] },
    { name: '3/4', pattern: [1, 0, 0], timeSignature: [3, 4] },
    { name: '2/4', pattern: [1, 0], timeSignature: [2, 4] },
    { name: '6/8', pattern: [1, 0, 0, 1, 0, 0], timeSignature: [6, 8] },
  ];

  // Patterns rythmiques prédéfinis
  const rhythmPatterns = [
    { name: 'Simple', pattern: '♩', description: 'Temps simples' },
    { name: 'Double', pattern: '♪', description: 'Subdivisions doubles' },
    { name: 'Triple', pattern: '♩♪♪', description: 'Subdivisions triples' },
    { name: 'Pointé', pattern: '♩.', description: 'Rythme pointé' },
  ];

  // Fonction pour arrêter le métronome si il joue
  const stopIfPlaying = () => {
    if (isPlaying) {
      toggleMetronome();
    }
  };

  return (
    <div className="space-y-6">
      {/* Métronome Principal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Métronome</h3>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-8">
            {/* Colonne gauche - Contrôles principaux */}
            <div className="space-y-8 flex flex-col items-center">
              {/* Affichage du tempo et bouton principal */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="text-8xl font-bold text-gray-900 mb-6">
                  {settings.bpm}
                  <span className="text-3xl text-gray-500 ml-3">BPM</span>
                </div>
                
                {/* Indicateur visuel */}
                {settings.visualFlash && (
                  <div className="flex justify-center mb-6 w-full">
                    <div className="flex gap-2 justify-center w-full">
                      {settings.timeSignature[0] === 6 && settings.timeSignature[1] === 8 ? (
                        // Affichage spécial pour 6/8 : 2 groupes de 3 points sur 2 lignes
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-1 justify-center">
                            {Array.from({ length: 3 }).map((_, i) => {
                              const isAccent = settings.pattern[i] === 1;
                              const shouldBeLit = currentBeat >= i;
                              return (
                                <div
                                  key={i}
                                  className={`rounded-full transition-all duration-100 ${
                                    isAccent ? 'w-4 h-4' : 'w-3 h-3'
                                  } ${shouldBeLit ? 'bg-blue-500' : 'bg-gray-300'}`}
                                />
                              );
                            })}
                          </div>
                          <div className="flex gap-1 justify-center">
                            {Array.from({ length: 3 }).map((_, i) => {
                              const isAccent = settings.pattern[i + 3] === 1;
                              const shouldBeLit = currentBeat >= i + 3;
                              return (
                                <div
                                  key={i + 3}
                                  className={`rounded-full transition-all duration-100 ${
                                    isAccent ? 'w-4 h-4' : 'w-3 h-3'
                                  } ${shouldBeLit ? 'bg-blue-500' : 'bg-gray-300'}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        // Affichage normal pour les autres signatures
                        Array.from({ length: settings.timeSignature[0] }).map((_, i) => {
                          const isAccent = settings.pattern[i] === 1;
                          const shouldBeLit = currentBeat >= i;
                          return (
                            <div
                              key={i}
                              className={`rounded-full transition-all duration-100 ${
                                isAccent ? 'w-4 h-4' : 'w-3 h-3'
                              } ${shouldBeLit ? 'bg-blue-500' : 'bg-gray-300'}`}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Bouton principal */}
                <button
                  onClick={toggleMetronome}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl transition-all duration-200 ${
                    isPlaying 
                      ? 'bg-red-500 hover:bg-red-600 shadow-xl' 
                      : 'bg-[#1473AA] hover:bg-blue-700 shadow-xl'
                  }`}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>
              </div>

              {/* Volume */}
              <div className="w-full max-w-xs">
                <label className="block text-lg font-medium text-gray-700 mb-4 text-center">Volume</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Vitesses prédéfinies */}
              <div className="w-full max-w-xs">
                <label className="block text-lg font-medium text-gray-700 mb-4 text-center">Vitesses prédéfinies</label>
                <div className="grid grid-cols-3 gap-2">
                  {[60, 78, 92, 120, 132, 144].map((bpm) => (
                    <button
                      key={bpm}
                      onClick={() => {
                        stopIfPlaying();
                        setSettings(prev => ({ ...prev, bpm: bpm }));
                      }}
                      className={`p-2 rounded-lg border transition-colors text-sm font-medium ${
                        settings.bpm === bpm
                          ? 'bg-[#1473AA] text-white border-[#1473AA]'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                      }`}
                    >
                      {bpm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrôles du tempo */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    stopIfPlaying();
                    setSettings(prev => ({ ...prev, bpm: Math.max(40, prev.bpm - 1) }));
                  }}
                  className="p-4 bg-[#1473AA] hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Minus className="w-6 h-6" />
                </button>
                
                <button
                  onClick={handleTapTempo}
                  className="px-8 py-4 bg-[#1473AA] hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Tap Tempo
                </button>
                
                <button
                  onClick={() => {
                    stopIfPlaying();
                    setSettings(prev => ({ ...prev, bpm: Math.min(200, prev.bpm + 1) }));
                  }}
                  className="p-4 bg-[#1473AA] hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>
              </div>

              {/* Slider BPM */}
              <div className="w-full max-w-xs">
                <input
                  type="range"
                  min="40"
                  max="200"
                  value={settings.bpm}
                  onChange={(e) => {
                    stopIfPlaying();
                    setSettings(prev => ({ ...prev, bpm: parseInt(e.target.value) }));
                  }}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-3">
                  <span>40 BPM</span>
                  <span>200 BPM</span>
                </div>
              </div>
            </div>

            {/* Colonne droite - Paramètres */}
            <div className="space-y-8">
              {/* Signature rythmique */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">Signature Rythmique</label>
                <div className="grid grid-cols-2 gap-3">
                  {presetPatterns.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        stopIfPlaying();
                        setSettings(prev => ({ 
                          ...prev, 
                          timeSignature: preset.timeSignature as [number, number],
                          pattern: preset.pattern,
                          accent: true,
                          rhythmPattern: preset.timeSignature[0] === 6 && preset.timeSignature[1] === 8 ? '♩.' : prev.rhythmPattern
                        }));
                      }}
                      className={`p-4 rounded-lg border transition-colors ${
                        settings.timeSignature[0] === preset.timeSignature[0] && 
                        settings.timeSignature[1] === preset.timeSignature[1]
                          ? 'bg-[#1473AA] text-white border-[#1473AA]'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-medium">{preset.name}</div>
                        <div className="text-sm opacity-75 mt-2">
                          {preset.timeSignature[0] === 6 && preset.timeSignature[1] === 8 ? (
                            // Affichage spécial pour 6/8 : 2 lignes de 3 points
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-center gap-1">
                                {preset.pattern.slice(0, 3).map((beat, i) => (
                                  <span key={i} className={`inline-block w-2 h-2 rounded-full ${
                                    beat === 1 ? 'bg-current' : 'bg-gray-400'
                                  }`} />
                                ))}
                              </div>
                              <div className="flex justify-center gap-1">
                                {preset.pattern.slice(3, 6).map((beat, i) => (
                                  <span key={i + 3} className={`inline-block w-2 h-2 rounded-full ${
                                    beat === 1 ? 'bg-current' : 'bg-gray-400'
                                  }`} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            // Affichage normal pour les autres signatures
                            preset.pattern.map((beat, i) => (
                              <span key={i} className={`inline-block w-2 h-2 rounded-full mx-1 ${
                                beat === 1 ? 'bg-current' : 'bg-gray-400'
                              }`} />
                            ))
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Patterns rythmiques */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">Subdivision Rythmique</label>
                <div className="grid grid-cols-3 gap-3">
                  {rhythmPatterns.map((rhythm) => (
                    <button
                      key={rhythm.name}
                      onClick={() => {
                        stopIfPlaying();
                        setSettings(prev => ({ ...prev, rhythmPattern: rhythm.pattern }));
                      }}
                      className={`p-4 rounded-lg border transition-colors flex items-center justify-center ${
                        settings.rhythmPattern === rhythm.pattern
                          ? 'bg-[#1473AA] text-white border-[#1473AA]'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                      }`}
                    >
                      <div className="text-3xl">{rhythm.pattern}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sons */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">Son</label>
                <select
                  value={settings.sound}
                  onChange={(e) => {
                    stopIfPlaying();
                    setSettings(prev => ({ ...prev, sound: e.target.value as any }));
                  }}
                  className="w-full p-3 rounded-lg border border-[#1473AA] text-lg focus:ring-2 focus:ring-[#1473AA] focus:border-[#1473AA]"
                >
                  <option value="click">Click</option>
                  <option value="woodblock">Woodblock</option>
                  <option value="bell">Bell</option>
                  <option value="electronic">Electronic</option>
                  <option value="drum">Drum</option>
                </select>
              </div>

              {/* Options */}
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.accent}
                    onChange={(e) => setSettings(prev => ({ ...prev, accent: e.target.checked }))}
                    className="rounded w-5 h-5"
                  />
                  <span className="text-lg text-gray-700">Accents</span>
                </label>
                
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.visualFlash}
                    onChange={(e) => setSettings(prev => ({ ...prev, visualFlash: e.target.checked }))}
                    className="rounded w-5 h-5"
                  />
                  <span className="text-lg text-gray-700">Flash visuel</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
