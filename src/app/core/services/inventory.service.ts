import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockMovement, StockMovementRequest, StockMovementResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getMovements(productId?: string): Observable<StockMovement[]> {
    let params = new HttpParams();
    if (productId) {
      params = params.set('productId', productId);
    }
    return this.http.get<StockMovement[]>(`${this.apiUrl}/movements`, { params });
  }

  recordMovement(data: StockMovementRequest): Observable<StockMovementResponse> {
    return this.http.post<StockMovementResponse>(`${this.apiUrl}/movements`, data);
  }
}
