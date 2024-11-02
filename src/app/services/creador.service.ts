import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import {catchError, Observable, Subject, throwError} from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CreadorService {
  public baseUrl: string = `${environment.apiUrl}/creador`;

  private _refresh$ = new Subject<void>();

  constructor(private http: HttpClient) {}


  get refresh$(){
    return this._refresh$;
  }

  obtenerCantidadRecetasCreadas(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/cantidadRecetas`, { withCredentials: true });
  }

  verPerfil(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/perfil`, { withCredentials: true }).pipe(
      tap(()=> {(
        this._refresh$.next()
      )})
    );
  }

  actualizarFotoPerfil(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/actualizarFotoPerfil`, formData, { withCredentials: true }).pipe(catchError((error) => {
      console.error('Error al actualizar foto perfil', error);
      return throwError(error);
    }));
  }
}
