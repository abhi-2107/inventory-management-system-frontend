import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Organization, Member } from '../models';

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly apiUrl = `${environment.apiUrl}/organization`;

  constructor(private http: HttpClient) {}

  getDetails(): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/details`);
  }

  getMembers(): Observable<Member[]> {
    return this.http.get<Member[]>(`${this.apiUrl}/members`);
  }

  addMember(data: { email: string; role: string; firstName: string; lastName: string }): Observable<Member & { tempPassword?: string }> {
    return this.http.post<Member & { tempPassword?: string }>(`${this.apiUrl}/members`, data);
  }

  revokeMember(memberId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/members/${memberId}`);
  }
}
