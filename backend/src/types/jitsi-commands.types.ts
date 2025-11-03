/**
 * Jitsi Meet Command Type Definitions
 * 
 * Type definitions for all available Jitsi Meet executeCommand commands
 * Use these types for better type safety when calling executeCommand
 */

/**
 * Command parameter types for executeCommand
 */
export interface JitsiCommands {
  // Participant Settings
  displayName: [name: string];
  email: [email: string];

  // Room Management
  password: [password: string];
  subject: [subject: string];
  localSubject: [subject: string];
  toggleLobby: [enabled: boolean];

  // Media Control
  toggleAudio: [];
  toggleVideo: [];
  toggleCamera: [facingMode?: 'user' | 'environment'];
  toggleCameraMirror: [];
  setVideoQuality: [height: number];
  setAudioOnly: [enable: boolean];

  // UI Control
  toggleFilmStrip: [];
  toggleChat: [];
  toggleRaiseHand: [];
  toggleShareScreen: [];
  toggleSubtitles: [];
  toggleTileView: [];
  toggleWhiteboard: [];
  toggleParticipantsPane: [enabled: boolean];
  setTileView: [enabled: boolean];

  // Video Sharing
  startShareVideo: [url: string];
  stopShareVideo: [];

  // Participant Control
  pinParticipant: [id?: string];
  setLargeVideoParticipant: [participantId?: string, videoType?: 'camera' | 'desktop'];
  setParticipantVolume: [participantID: string, volume: number];
  muteEveryone: [mediaType?: 'audio' | 'video'];
  kickParticipant: [participantID: string];
  grantModerator: [participantID: string];

  // Chat
  sendChatMessage: [message: string, to?: string, ignorePrivacy?: boolean];
  initiatePrivateChat: [participantID: string];
  cancelPrivateChat: [];

  // Moderation
  toggleModeration: [enable: boolean, mediaType?: 'audio' | 'video'];
  askToUnmute: [participantId: string];
  approveVideo: [participantId: string];
  rejectParticipant: [participantId: string, mediaType?: 'audio' | 'video'];

  // Recording
  startRecording: [options: {
    mode: 'local' | 'file' | 'stream';
    dropboxToken?: string;
    onlySelf?: boolean;
    shouldShare?: boolean;
    rtmpStreamKey?: string;
    rtmpBroadcastID?: string;
    youtubeStreamKey?: string;
    youtubeBroadcastID?: string;
    extraMetadata?: Record<string, unknown>;
    transcription?: boolean;
  }];
  stopRecording: [mode: 'local' | 'file' | 'stream', transcription?: boolean];

  // Breakout Rooms
  addBreakoutRoom: [name?: string];
  autoAssignToBreakoutRooms: [];
  closeBreakoutRoom: [roomId: string];
  joinBreakoutRoom: [roomId?: string];
  removeBreakoutRoom: [breakoutRoomJid: string];
  sendParticipantToRoom: [participantId: string, roomId: string];

  // Virtual Background
  setVirtualBackground: [enabled: boolean, backgroundImage: string];
  setBlurredBackground: [blurType: 'slight-blur' | 'blur' | 'none'];
  toggleVirtualBackgroundDialog: [];

  // Noise Suppression
  setNoiseSuppressionEnabled: [options: { enabled: boolean }];

  // Follow Me
  setFollowMe: [value: boolean, recorderOnly?: boolean];

  // Subtitles
  setSubtitles: [enabled: boolean, displaySubtitles?: boolean, language?: string | null];

  // Configuration
  overwriteConfig: [config: Record<string, unknown>];
  setAssumedBandwidthBps: [assumedBandwidthBps: number];

  // Participant Messages
  sendCameraFacingMode: [receiverParticipantId: string, facingMode?: 'user' | 'environment'];
  sendEndpointTextMessage: [receiverParticipantId: string, text: string];
  sendTones: [options: {
    tones: string;
    duration?: number;
    pause?: number;
  }];

  // Lobby
  answerKnockingParticipant: [id: string, approved: boolean];

  // Notifications
  showNotification: [options: {
    title: string;
    description: string;
    customActions?: Array<{ label: string; uuid: string }>;
    uid?: string;
    type?: 'normal' | 'success' | 'warning' | 'error';
    timeout?: 'short' | 'medium' | 'long' | 'sticky';
  }];
  hideNotification: [uid: string];

  // Participant Names
  overwriteNames: [participants: Array<{ id: string; name: string }>];

  // Resize
  resizeFilmStrip: [options: { width: number }];
  resizeLargeVideo: [width: number, height: number];

  // Conference Control
  hangup: [];
  endConference: [];
}

/**
 * All available Jitsi Meet command names
 */
export type JitsiCommandName = keyof JitsiCommands;

/**
 * Helper type to extract command parameters
 */
export type JitsiCommandParams<T extends JitsiCommandName> = JitsiCommands[T];

/**
 * Type-safe executeCommand function
 */
export type ExecuteCommand = <T extends JitsiCommandName>(
  command: T,
  ...args: JitsiCommandParams<T>
) => void;

/**
 * Type for executeCommands parameter
 */
export type JitsiCommandsMap = {
  [K in JitsiCommandName]?: JitsiCommands[K];
};

