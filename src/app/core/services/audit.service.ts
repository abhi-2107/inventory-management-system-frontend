import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuditLog } from '../models';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly apiUrl = `${environment.apiUrl}/audit`;

  constructor(private http: HttpClient) {}

  getLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(this.apiUrl);
  }
}
