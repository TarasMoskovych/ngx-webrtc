import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  private sessionKey = 'ngx-webrtc:channelId';
  public form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private localStorage: Storage,
  ) { }

  get channelId(): string {
    return this.localStorage.getItem(this.sessionKey) || 'test-channel-ngx-webrtc';
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      channelId: [this.channelId, Validators.required],
    });
  }

  onSubmit(): void {
    const { channelId } = this.form.value;

    this.localStorage.setItem(this.sessionKey, channelId);
    this.router.navigate(['conference'], { queryParams: { ...this.form.value } });
  }
}
