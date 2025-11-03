/**
 * Jitsi Meet Event Type Definitions
 * 
 * Type definitions for all available Jitsi Meet events
 * Used with addListener/removeListener methods
 */

/**
 * Event data types for Jitsi Meet events
 */
export interface JitsiEventData {
  // Error Events
  cameraError: {
    type: string;
    message: string;
  };

  micError: {
    type: string;
    message: string;
  };

  errorOccurred: {
    details?: Record<string, unknown>;
    message?: string;
    name: string;
    type: 'CONFIG' | 'CONNECTION' | 'CONFERENCE';
    isFatal: boolean;
  };

  feedbackSubmitted: {
    error?: string;
  };

  // Participant Events
  avatarChanged: {
    id: string;
    avatarURL: string;
  };

  displayNameChange: {
    id: string;
    displayname: string;
  };

  emailChange: {
    id: string;
    email: string;
  };

  participantJoined: {
    id: string;
    displayName: string;
  };

  participantLeft: {
    id: string;
  };

  participantKickedOut: {
    kicked: {
      id: string;
      local: boolean;
    };
    kicker: {
      id: string;
    };
  };

  participantRoleChanged: {
    id: string;
    role: string;
  };

  // Media Events
  audioAvailabilityChanged: {
    available: boolean;
  };

  audioMuteStatusChanged: {
    muted: boolean;
  };

  videoAvailabilityChanged: {
    available: boolean;
  };

  videoMuteStatusChanged: {
    muted: boolean;
  };

  videoQualityChanged: {
    videoQuality: number;
  };

  audioOnlyChanged: {
    audioOnlyChanged: boolean;
  };

  // UI Events
  largeVideoChanged: {
    id: string;
  };

  dominantSpeakerChanged: {
    id: string;
  };

  tileViewChanged: {
    enabled: boolean;
  };

  chatUpdated: {
    isOpen: boolean;
    unreadCount: number;
  };

  incomingMessage: {
    from: string;
    nick: string;
    privateMessage: boolean;
    message: string;
    stamp: string;
  };

  outgoingMessage: {
    message: string;
    privateMessage: boolean;
  };

  filmstripDisplayChanged: {
    visible: boolean;
  };

  participantsPaneToggled: {
    open: boolean;
  };

  raiseHandUpdated: {
    id: string;
    handRaised: number;
  };

  screenSharingStatusChanged: {
    on: boolean;
    details: {
      sourceType?: 'window' | 'screen' | 'proxy' | 'device';
    };
  };

  contentSharingParticipantsChanged: {
    data: string[];
  };

  // Conference Events
  videoConferenceJoined: {
    roomName: string;
    id: string;
    displayName: string;
    avatarURL: string;
    breakoutRoom: boolean;
    visitor: boolean;
  };

  videoConferenceLeft: {
    roomName: string;
  };

  conferenceCreatedTimestamp: {
    timestamp: number;
  };

  subjectChange: {
    subject: string;
  };

  passwordRequired: Record<string, never>; // Empty object

  // Breakout Rooms
  breakoutRoomsUpdated: {
    [roomId: string]: {
      id: string;
      jid: string;
      name: string;
      isMainRoom?: true;
      participants: {
        [participantJid: string]: {
          displayName: string;
          jid: string;
          role: string;
        };
      };
    };
  };

  knockingParticipant: {
    participant: {
      id: string;
      name: string;
    };
  };

  // Recording Events
  recordingStatusChanged: {
    on: boolean;
    mode: 'local' | 'stream' | 'file';
    error?: string;
    transcription: boolean;
  };

  recordingLinkAvailable: {
    link: string;
    ttl: number;
  };

  // Transcription Events
  transcribingStatusChanged: {
    on: boolean;
  };

  transcriptionChunkReceived: {
    language: string;
    messageID: string;
    participant: {
      avatarUrl: string;
      id: string;
      name: string;
    };
    final?: string;
    stable?: string;
    unstable?: string;
  };

  // Moderation Events
  moderationStatusChanged: {
    mediaType: string;
    enabled: boolean;
  };

  moderationParticipantApproved: {
    id: string;
    mediaType: string;
  };

  moderationParticipantRejected: {
    id: string;
    mediaType: string;
  };

  // Device Events
  deviceListChanged: {
    devices: {
      audioInput: Array<{
        deviceId: string;
        groupId: string;
        kind: 'audioinput';
        label: string;
      }>;
      audioOutput: Array<{
        deviceId: string;
        groupId: string;
        kind: 'audioOutput';
        label: string;
      }>;
      videoInput: Array<{
        deviceId: string;
        groupId: string;
        kind: 'videoInput';
        label: string;
      }>;
    };
  };

  // Communication Events
  endpointTextMessageReceived: {
    senderInfo: {
      jid: string;
      id: string;
    };
    eventData: {
      name: string;
      text: string;
    };
  };

  nonParticipantMessageReceived: {
    id: string | null;
    message: string;
  };

  dataChannelOpened: Record<string, never>; // Empty object

  // Browser/Mouse Events
  browserSupport: {
    supported: boolean;
  };

  mouseEnter: {
    event: {
      clientX: number;
      clientY: number;
      movementX: number;
      movementY: number;
      offsetX: number;
      offsetY: number;
      pageX: number;
      pageY: number;
      x: number;
      y: number;
      screenX: number;
      screenY: number;
    };
  };

  mouseLeave: {
    event: {
      clientX: number;
      clientY: number;
      movementX: number;
      movementY: number;
      offsetX: number;
      offsetY: number;
      pageX: number;
      pageY: number;
      x: number;
      y: number;
      screenX: number;
      screenY: number;
    };
  };

  mouseMove: {
    event: {
      clientX: number;
      clientY: number;
      movementX: number;
      movementY: number;
      offsetX: number;
      offsetY: number;
      pageX: number;
      pageY: number;
      x: number;
      y: number;
      screenX: number;
      screenY: number;
    };
  };

  // Button Click Events
  toolbarButtonClicked: {
    key: string;
    preventExecution: boolean;
  };

  participantMenuButtonClick: {
    key: string;
    participantId: string;
    preventExecution: boolean;
  };

  // Notification Events
  notificationTriggered: {
    title: string;
    description: string;
  };

  customNotificationActionTriggered: {
    data: {
      id: string;
    };
  };

  // Face Landmarks
  faceLandmarkDetected: {
    faceBox?: {
      left: number;
      right: number;
      width: number;
    };
    faceExpression: string;
  };

  // Whiteboard
  whiteboardStatusChanged: {
    status: string;
  };

  // Connection Events
  p2pStatusChanged: {
    isP2p: boolean | null;
  };

  suspendDetected: Record<string, never>; // Empty object

  peerConnectionFailure: {
    isP2P: boolean;
    wasConnected: boolean;
  };

  readyToClose: Record<string, never>; // Empty object

  // Log Events
  log: {
    logLevel: 'info' | 'error' | 'debug' | 'warn';
    args: string;
  };
}

/**
 * All available Jitsi Meet event names
 */
export type JitsiEventName = keyof JitsiEventData;

/**
 * Event listener function type
 */
export type JitsiEventListener<T extends JitsiEventName> = (
  data: JitsiEventData[T]
) => void;

/**
 * Generic event listener function
 */
export type JitsiEventGenericListener = (data: unknown) => void;

