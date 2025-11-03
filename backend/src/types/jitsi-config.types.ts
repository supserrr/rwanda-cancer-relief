/**
 * Jitsi Meet Configuration Type Definitions
 * 
 * Type definitions for Jitsi Meet configuration options
 * These can be set in config.js or overridden via configOverwrite
 */

/**
 * Main Jitsi Meet configuration interface
 */
export interface JitsiMeetConfig {
  // API Configuration
  apiLogLevels?: ('warn' | 'log' | 'error' | 'info' | 'debug')[];
  buttonsWithNotifyClick?: Array<string | {
    key: string;
    preventExecution: boolean;
  }>;
  customParticipantMenuButtons?: Array<{
    icon: string;
    id: string;
    text: string;
  }>;
  customToolbarButtons?: Array<{
    icon: string;
    id: string;
    text: string;
  }>;
  mouseMoveCallbackInterval?: number;
  participantMenuButtonsWithNotifyClick?: Array<string | {
    key: string;
    preventExecution: boolean;
  }>;
  useHostPageLocalStorage?: boolean;

  // Audio Configuration
  audioLevelsInterval?: number;
  audioQuality?: {
    stereo?: boolean;
    opusMaxAverageBitrate?: number | null; // 6000 to 510000 range
  };
  disableAudioLevels?: boolean;
  disableSpeakerStatsSearch?: boolean; // DEPRECATED - Use speakerStats.disableSearch
  disabledSounds?: string[];
  enableNoAudioDetection?: boolean;
  enableNoisyMicDetection?: boolean;
  speakerStats?: {
    disabled?: boolean;
    disableSearch?: boolean;
    order?: ('role' | 'name' | 'hasLeft')[];
  };
  speakerStatsOrder?: ('role' | 'name' | 'hasLeft')[]; // DEPRECATED - Use speakerStats.order
  startAudioMuted?: number;
  startAudioOnly?: boolean;
  startSilent?: boolean;
  startWithAudioMuted?: boolean;

  // Breakout Rooms
  breakoutRooms?: {
    hideAddRoomButton?: boolean;
    hideAutoAssignButton?: boolean;
    hideJoinRoomButton?: boolean;
    hideModeratorSettingsTab?: boolean;
    hideMoreActionsButton?: boolean;
    hideMuteAllButton?: boolean;
  };
  hideAddRoomButton?: boolean; // DEPRECATED - Use breakoutRooms.hideAddRoomButton

  // Callstats
  callStatsConfigParams?: {
    disableBeforeUnloadHandler?: boolean;
    applicationVersion?: string;
    disablePrecalltest?: boolean;
    siteID?: string;
    additionalIDs?: {
      customerID?: string;
      tenantID?: string;
      productName?: string;
      meetingsName?: string;
      serverName?: string;
      pbxID?: string;
      pbxExtensionID?: string;
      fqExtensionID?: string;
      sessionID?: string;
    };
    collectLegacyStats?: boolean;
    collectIP?: boolean;
  };
  callStatsID?: string;
  callStatsSecret?: string;
  enableDisplayNameInStats?: boolean;
  enableEmailInStats?: boolean;
  feedbackPercentage?: number;

  // Transcription
  transcription?: {
    enabled?: boolean;
    translationLanguages?: string[];
    useAppLanguage?: boolean;
    preferredLanguage?: string;
    autoTranscribeOnRecord?: boolean;
  };
  autoCaptionOnRecord?: boolean; // DEPRECATED - Use transcription.autoTranscribeOnRecord
  preferredTranscribingLanguage?: string; // DEPRECATED - Use transcription.preferredLanguage
  transcribeWithAppLanguage?: boolean; // DEPRECATED - Use transcription.useAppLanguage
  transcribingEnabled?: boolean; // DEPRECATED - Use transcription.enabled

  // Connection
  bosh?: string;
  disableRtx?: boolean;
  disableSimulcast?: boolean;
  e2ee?: {
    labels?: {
      labelTooltip?: string;
      description?: string;
      label?: string;
      warning?: string;
    };
    externallyManagedKey?: boolean;
  };
  e2eping?: {
    enabled?: boolean;
    numRequests?: number;
    maxConferenceSize?: number;
    maxMessagesPerSecond?: number;
  };
  enableEncodedTransformSupport?: boolean;
  enableForcedReload?: boolean; // 🚫 Not overwritable
  gatherStats?: boolean;
  hosts?: {
    domain?: string;
    anonymousdomain?: string;
    authdomain?: string;
    focus?: string;
    muc?: string;
  };
  p2p?: {
    enabled?: boolean;
    enableUnifiedOnChrome?: boolean;
    iceTransportPolicy?: 'all' | 'relay';
    codecPreferenceOrder?: string[];
    mobileCodecPreferenceOrder?: string[];
    backToP2PDelay?: number;
    stunServers?: Array<{ urls: string }>;
  };
  pcStatsInterval?: number;
  peopleSearchQueryTypes?: ('phone' | 'room' | 'sip' | 'user' | 'videosipgw' | 'email')[];
  peopleSearchUrl?: string;
  inviteServiceUrl?: string;
  peopleSearchTokenLocation?: string;
  useTurnUdp?: boolean;
  webrtcIceTcpDisable?: boolean;
  webrtcIceUdpDisable?: boolean;
  websocket?: string; // 🚫 Not overwritable

  // Etherpad
  etherpad_base?: string;
  openSharedDocumentOnJoin?: boolean;

  // Filmstrip
  disableFilmstripAutohiding?: boolean;
  filmstrip?: {
    disableResizable?: boolean;
    disableStageFilmstrip?: boolean;
  };
  disableCameraTintForeground?: boolean;

  // Face Landmarks
  faceLandmarks?: {
    enableFaceCentering?: boolean;
    enableFaceExpressionsDetection?: boolean;
    enableDisplayFaceExpressions?: boolean;
    enableRTCStats?: boolean;
    faceCenteringThreshold?: number;
    captureInterval?: number;
  };

  // Giphy
  giphy?: {
    enabled?: boolean;
    sdkKey?: string;
    displayMode?: 'tile' | 'chat' | 'all';
    tileTime?: number;
    rating?: 'g' | 'pg' | 'pg-13' | 'r';
  };

  // Gravatar
  gravatar?: {
    baseUrl?: string; // 🚫 Not overwritable
    disabled?: boolean;
  };
  gravatarBaseURL?: string; // DEPRECATED - Use gravatar.baseUrl

  // LastN
  channelLastN?: number; // -1 for unlimited
  startLastN?: number;

  // Lobby
  lobby?: {
    autoKnock?: boolean;
    enableChat?: boolean;
  };
  autoKnockLobby?: boolean; // DEPRECATED - Use lobby.autoKnock
  enableLobbyChat?: boolean; // DEPRECATED - Use lobby.enableChat
  hideLobbyButton?: boolean; // DEPRECATED - Use securityUi.hideLobbyButton

  // Moderator
  disableModeratorIndicator?: boolean;
  disableReactionsModeration?: boolean;
  disableRemoteMute?: boolean;

  // Notifications
  notifications?: string[];
  disabledNotifications?: string[];

  // Participants Pane
  participantsPane?: {
    hideModeratorSettingsTab?: boolean;
    hideMoreActionsButton?: boolean;
    hideMuteAllButton?: boolean;
  };

  // Recording
  dropbox?: {
    appKey?: string;
    redirectURI?: string;
  };
  fileRecordingsEnabled?: boolean;
  fileRecordingsServiceEnabled?: boolean; // 🚫 Not overwritable
  fileRecordingsServiceSharingEnabled?: boolean; // 🚫 Not overwritable
  hideRecordingLabel?: boolean;
  localRecording?: {
    disable?: boolean;
    notifyAllParticipants?: boolean;
  };
  recordingLimit?: { // 🚫 Not overwritable
    limit?: number;
    appName?: string;
    appURL?: string;
  };
  recordings?: {
    recordAudioAndVideo?: boolean;
    suggestRecording?: boolean;
    showPrejoinWarning?: boolean;
    showRecordingLink?: boolean;
  };

  // Screen Sharing
  desktopSharingFrameRate?: {
    min?: number;
    max?: number;
  };
  disableScreensharingVirtualBackground?: boolean;
  screenshotCapture?: {
    enabled?: boolean;
    mode?: 'recording' | 'always';
  };

  // Security UI
  securityUi?: {
    hideLobbyButton?: boolean;
    disableLobbyPassword?: boolean;
  };

  // Testing
  testing?: {
    assumeBandwidth?: boolean;
    disableE2EE?: boolean;
    mobileXmppWsThreshold?: number;
    p2pTestMode?: boolean;
    testMode?: boolean;
    noAutoPlayVideo?: boolean;
  };

  // Video
  constraints?: {
    video?: {
      height?: {
        ideal?: number;
        max?: number;
        min?: number;
      };
      width?: {
        ideal?: number;
        max?: number;
        min?: number;
      };
      facingMode?: 'user' | 'environment';
      frameRate?: {
        ideal?: number;
        max?: number;
        min?: number;
      };
    };
    audio?: {
      deviceId?: string;
      echoCancellation?: boolean;
      noiseSuppression?: boolean;
      autoGainControl?: boolean;
    };
  };
  disableAddingBackgroundImages?: boolean;
  disableH264?: boolean;
  disableLocalVideoFlip?: boolean;
  disableSelfView?: boolean;
  doNotFlipLocalVideo?: boolean;
  maxFullResolutionParticipants?: number; // -1 to disable
  resolution?: number;
  startVideoMuted?: number;
  startWithVideoMuted?: boolean;
  videoQuality?: {
    codecPreferenceOrder?: string[];
    mobileCodecPreferenceOrder?: string[];
    av1?: {
      maxBitratesVideo?: {
        low?: number;
        standard?: number;
        high?: number;
        fullHd?: number;
        ultraHd?: number;
        ssHigh?: number;
      };
      scalabilityModeEnabled?: boolean;
      useSimulcast?: boolean;
      useKSVC?: boolean;
    };
    h264?: {
      maxBitratesVideo?: {
        low?: number;
        standard?: number;
        high?: number;
        fullHd?: number;
        ultraHd?: number;
        ssHigh?: number;
      };
      scalabilityModeEnabled?: boolean;
    };
    vp8?: {
      maxBitratesVideo?: {
        low?: number;
        standard?: number;
        high?: number;
        fullHd?: number;
        ultraHd?: number;
        ssHigh?: number;
      };
      scalabilityModeEnabled?: boolean;
    };
    vp9?: {
      maxBitratesVideo?: {
        low?: number;
        standard?: number;
        high?: number;
        fullHd?: number;
        ultraHd?: number;
        ssHigh?: number;
      };
      scalabilityModeEnabled?: boolean;
      useSimulcast?: boolean;
      useKSVC?: boolean;
    };
    minHeightForQualityLvl?: {
      low?: number;
      standard?: number;
      high?: number;
    };
  };

  // Whiteboard
  whiteboard?: {
    enabled?: boolean;
    collabServerBaseUrl?: string;
    userLimit?: number;
    limitUrl?: string;
  };

  // Additional properties (catch-all for any other config options)
  [key: string]: unknown;
}

/**
 * Configuration overrides (configOverwrite)
 * 
 * Most configuration options can be overridden at runtime using configOverwrite
 * Options marked with 🚫 cannot be overridden
 */
export type JitsiConfigOverwrite = Partial<Omit<JitsiMeetConfig, 'enableForcedReload' | 'websocket' | 'fileRecordingsServiceEnabled' | 'fileRecordingsServiceSharingEnabled' | 'recordingLimit' | 'gravatar'>> & {
  gravatar?: Omit<JitsiMeetConfig['gravatar'], 'baseUrl'>;
};

