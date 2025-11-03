/**
 * Jitsi Meet API Type Definitions
 * 
 * Type definitions for Jitsi Meet External API functions
 * Used with React SDK onApiReady callback and IFrame API
 */

/**
 * Jitsi Meet External API interface
 * 
 * This interface defines all available methods on the Jitsi Meet API
 */
export interface JitsiMeetExternalAPI {
  // Device Management
  getAvailableDevices(): Promise<{
    audioInput: MediaDeviceInfo[];
    audioOutput: MediaDeviceInfo[];
    videoInput: MediaDeviceInfo[];
  }>;
  getCurrentDevices(): Promise<{
    audioInput?: MediaDeviceInfo;
    audioOutput?: MediaDeviceInfo;
    videoInput?: MediaDeviceInfo;
  }>;
  setAudioInputDevice(deviceLabel: string, deviceId?: string): void;
  setAudioOutputDevice(deviceLabel: string, deviceId?: string): void;
  setVideoInputDevice(deviceLabel: string, deviceId?: string): void;
  isDeviceChangeAvailable(deviceType?: 'input' | 'output'): Promise<boolean>;
  isDeviceListAvailable(): Promise<boolean>;
  isMultipleAudioInputSupported(): Promise<boolean>;

  // Media Control
  isAudioMuted(): Promise<boolean>;
  isVideoMuted(): Promise<boolean>;
  isAudioAvailable(): Promise<boolean>;
  isVideoAvailable(): Promise<boolean>;
  isAudioDisabled(): Promise<boolean>;

  // Participant Management
  getRoomsInfo(): Promise<{
    rooms: Array<{
      isMainRoom: boolean;
      id: string;
      jid: string;
      participants: Array<{
        id: string;
        jid: string;
        role: string;
        displayName: string;
        avatarUrl?: string;
      }>;
    }>;
  }>;
  getNumberOfParticipants(): number;
  getDisplayName(participantId: string): string;
  getEmail(participantId: string): string;
  pinParticipant(participantId: string, videoType?: 'camera' | 'desktop'): void;
  setLargeVideoParticipant(participantId?: string): void;

  // Conference Information
  getSessionId(): Promise<string>;
  getVideoQuality(): number;
  getDeploymentInfo(): Promise<{
    region?: string;
    shard?: string;
    [key: string]: unknown;
  }>;
  getLivestreamUrl(): Promise<{
    livestreamUrl: string;
  }>;
  getSharedDocumentUrl(): Promise<string>;

  // Screenshots
  captureLargeVideoScreenshot(): Promise<{
    dataURL: string;
  }>;
  captureCameraPicture(
    cameraFacingMode?: 'environment' | 'user',
    descriptionText?: string,
    titleText?: string
  ): Promise<{
    dataURL?: string;
    error?: string;
  }>;

  // Content Sharing
  getContentSharingParticipants(): Promise<{
    sharingParticipantIds: string[];
  }>;

  // Virtual Background
  setVirtualBackground(enabled: boolean, backgroundImage?: string): void;

  // UI Control
  resizeLargeVideo(width: number, height: number): void;
  isParticipantsPaneOpen(): Promise<boolean>;

  // Recording
  startRecording(options: {
    mode: 'file' | 'stream';
    [key: string]: unknown;
  }): void;
  stopRecording(mode: 'file' | 'stream', transcription?: boolean): void;

  // Invitations
  invite(invitees: Array<{
    type: 'phone';
    number: string;
  } | {
    type: 'sip';
    address: string;
  }>): Promise<void>;

  // Moderation
  isModerationOn(mediaType?: 'audio' | 'video'): Promise<boolean>;
  isParticipantForceMuted(
    participantId: string,
    mediaType?: 'audio' | 'video'
  ): Promise<boolean>;

  // Other Functions
  isVisitor(): boolean;
  isP2pActive(): Promise<boolean | null>;
  isStartSilent(): Promise<boolean>;
  listBreakoutRooms(): Promise<Record<string, unknown>>;
  getSupportedCommands(): string[];
  getSupportedEvents(): string[];
  getIFrame(): unknown; // HTMLIFrameElement (DOM type, use in frontend)
  dispose(): void;

  // Event Listeners
  on(event: string, listener: (...args: unknown[]) => void): void;
  off(event: string, listener: (...args: unknown[]) => void): void;
  addListener(event: string, listener: (...args: unknown[]) => void): void;
  removeListener(event: string, listener: (...args: unknown[]) => void): void;

  // Commands
  executeCommand(command: string, ...args: unknown[]): void;
  executeCommands(commands: Record<string, unknown[]>): void;
}

/**
 * Media Device Info
 */
export interface MediaDeviceInfo {
  deviceId: string;
  groupId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
}

/**
 * Participant Information
 */
export interface ParticipantInfo {
  id: string;
  jid: string;
  role: 'participant' | 'moderator';
  displayName: string;
  avatarUrl?: string;
}

/**
 * Room Information
 */
export interface RoomInfo {
  isMainRoom: boolean;
  id: string;
  jid: string;
  participants: ParticipantInfo[];
}

