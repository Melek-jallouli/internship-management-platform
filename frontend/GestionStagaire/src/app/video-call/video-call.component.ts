import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var JitsiMeetExternalAPI: any; // On déclare l'API Jitsi

@Component({
  selector: 'app-video-call',
  standalone: true,
  template: `<div id="jitsi-iframe" style="height: 100vh; width: 100%;"></div>`,
})
export class VideoCallComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  api: any;

  ngOnInit(): void {
    const roomName = this.route.snapshot.params['roomName'];
    this.initJitsi(roomName);
  }

  initJitsi(roomName: string): void {
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-iframe'),
      configOverwrite: {
        startWithAudioMuted: true,
        disableInviteFunctions: true // On garde ça privé pour ton app
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fadedbuttons', 'link', 'raisehand', 'videoquality', 'filmstrip',
          'invite', 'feedback', 'stats', 'shortcuts', 'tileview', 'videobackgroundblur',
          'download', 'help', 'mute-everyone', 'security'
        ],
      },
    };
    this.api = new JitsiMeetExternalAPI(domain, options);
  }

  ngOnDestroy(): void {
    if (this.api) {
      this.api.dispose(); // On ferme la connexion proprement en quittant la page
    }
  }
}