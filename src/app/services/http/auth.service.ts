import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { EMPTY, Observable, catchError, retry, tap, of } from 'rxjs';
import { ApiStore } from "../apiSpecificData";
import { ClassicResponse, UserLogin, UserLoginResponse } from '../../api/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  http = inject(HttpClient)

  authenticateUser(authData:UserLogin):Observable<HttpResponse<UserLoginResponse> | HttpErrorResponse>{
    return this.http.post<UserLoginResponse>(ApiStore.mergeEndpoint("auth","login"),authData,{
      observe:"response"
    }).pipe(
      tap((data)=>console.log(data)),
      retry(3),
      catchError((err: HttpErrorResponse) => {
        console.error(err);
        return of(err);
      })
    )
  }

  logoutUser():Observable<HttpResponse<UserLoginResponse>>{
    return this.http.post<UserLoginResponse>(ApiStore.mergeEndpoint("auth","logout"),{},{
      observe:"response"
    }).pipe(
      tap((data)=>console.log(data)),
      retry(3),
      catchError(err => {
        console.error(err);
        return EMPTY;
      })
    )
  }

  switchRole():Observable<HttpResponse<ClassicResponse>>{
    return this.http.post<ClassicResponse>(ApiStore.mergeEndpoint("auth","switch-role"),{},{
      observe:"response"
    }).pipe(
      tap((data)=>console.log(data)),
      retry(3),
      catchError(err => {
        console.error(err);
        return EMPTY;
      })
    )
  }

}
