import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  captcha = '';
  hidePassword = true;

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    captchaInput: ['', Validators.required],
  });
  user: any;

  constructor(private fb: FormBuilder, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.generateCaptcha();
    this.user = this.route.snapshot.queryParamMap.get('user');
  }

  generateCaptcha(): void {
    this.captcha = Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }
}
