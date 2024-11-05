import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import packageJson from '../../package.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @HostBinding('attr.app-version') appVersion = packageJson.version;
}
