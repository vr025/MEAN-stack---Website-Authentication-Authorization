import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import {   Subject } from "rxjs";
import { Router } from '@angular/router';


// tslint:disable-next-line:quotemark
@Injectable({providedIn: "root"})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: NodeJS.Timer;
  private userId: string;
  private authStateListener = new Subject<boolean>();

    // tslint:disable-next-line:one-line
    constructor(private http: HttpClient, private router: Router){}

    getToken() {
      return this.token;
    }

    getIsAuth() {
      return this.isAuthenticated;
    }

    getUserId() {
      return this.userId;
    }
    getAuthStatusListener(){
      return this.authStateListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {email: email, password: password};
        // tslint:disable-next-line:quotemark
        this.http.post("http://localhost:3000/api/user/signup", authData)
        .subscribe(() => {
            this.router.navigate(['/']);
        }, error => {
          this.authStateListener.next(false);
        });
    }

    login(email: string, password: string) {
      const authData: AuthData = {email: email, password: password};
      // tslint:disable-next-line:quotemark
      this.http.post<{token: string, expiresIn: number, userId: string}>("http://localhost:3000/api/user/login", authData)
      .subscribe(response => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = response.userId;
            this.authStateListener.next(true);
            const now = new Date();
            const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
            console.log(expirationDate);
            this.saveAuthData(token, expirationDate, this.userId);
            this.router.navigate(['/']);
          }
      }, error => {
        this.authStateListener.next(false);
      });
    }

    autoAuthUser() {
      const authInformation = this.getAuthData();
      if(!authInformation){
        return;
      }
      const now = new Date();
      const expiresIn = authInformation.expirationDate.getTime() - now.getTime() ;
      if(expiresIn > 0){
        this.token = authInformation.token;
        this.isAuthenticated = true;
        this.userId = authInformation.userId;
        this.setAuthTimer(expiresIn / 1000);
        this.authStateListener.next(true);
      }
    }

    logout() {
      this.token = null;
      this.isAuthenticated = false;
      this.authStateListener.next(false);
      clearTimeout(this.tokenTimer);
      this.userId = null;
      this.clearAuthData();
      this.router.navigate(['/']);
    }

    private setAuthTimer (duration: number) {
      console.log("Setting time " + duration);
      this.tokenTimer = setTimeout(() => {
        this.logout();
      }, duration * 1000)
    }


    private saveAuthData (token: string, expirationDate: Date, userId: string) {
      localStorage.setItem('token', token);
      localStorage.setItem('expiration', expirationDate.toISOString());
      localStorage.setItem('userId', userId);
    }

    private clearAuthData(){
      localStorage.removeItem('token');
      localStorage.removeItem('expiration');
      localStorage.removeItem('userId');
    }

    private getAuthData() {
      const token = localStorage.getItem('token');
      const expirationDate = localStorage.getItem('expiration');
      const userId = localStorage.getItem('userId');

      if(!token || !expirationDate){
        return;
      } else {
        return {
          token: token,
          expirationDate : new Date(expirationDate),
          userId: userId
        }
      }
    }

}



