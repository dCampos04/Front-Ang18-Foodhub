import { Component, OnInit } from '@angular/core';
import { CreadorDTO } from '../../interfaces/CreadorDTO';
import { CreadorService } from '../../services/creador.service';
import { environment } from '../../../environments/environment.development';
import { CreadorProfileDTO } from '../../interfaces/CreadorProfileDTO';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { catchError, of, retry } from 'rxjs';

@Component({
  selector: 'app-perfil-creador',
  standalone: true,
  imports: [],
  templateUrl: './perfil-creador.component.html',
  styleUrl: './perfil-creador.component.css',
})
export class PerfilCreadorComponent implements OnInit {
  public creadorDTO: CreadorProfileDTO = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correoElectronico: '',
    codigoColegiatura: '',
    fotoPerfil: '',
  };

  defaultImage: string = '/default-profile-image.jpg';
  preview: string | ArrayBuffer | null = this.defaultImage;
  selectedFile: File | null = null;
  imagen: string = '';
  errorRegistro: boolean = false;

  mostrarModalNoDatosPerfil: boolean = false;

  public errorImagenPerfil: string = '';
  public statusImagenPerfil: boolean = false;

  public urlImages: string = `${environment.apiUrl}/imagenes/`;

  constructor(
    private creadorService: CreadorService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.obtenerDatosPerfilCreador();
  }

  obtenerDatosPerfilCreador() {
    this.creadorService.verPerfil().subscribe(
      (response) => {
        this.creadorDTO = response;

        // Si algunos campos importantes están vacíos, mostramos el modal
        if (
          !this.creadorDTO.nombre ||
          !this.creadorDTO.apellidoPaterno ||
          !this.creadorDTO.apellidoMaterno ||
          !this.creadorDTO.correoElectronico
        ) {
          this.mostrarModalNoDatosPerfil = true;
        }
      },
      (error) => {
        // En caso de error, mostramos el modal
        this.mostrarModalNoDatosPerfil = true;
        console.error('Error al obtener los datos del perfil:', error);
      }
    );
  }
  
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
    this.convertToBase64();
  }

  convertToBase64() {
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        this.imagen = reader.result as string;
        this.subirFotoPerfil();
      };
      reader.onerror = (error) => {
        console.log(`Error: ${error}`);
      };
    }
  }

  subirFotoPerfil() {
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('fotoPerfil', this.selectedFile);

      this.creadorService.actualizarFotoPerfil(formData).pipe(
        catchError((error) => {
          if (error.status === 400 && error?.error?.message === 'El archivo de imagen está vacío') {
            this.errorImagenPerfil = 'El archivo de imagen está vacío.';
          } else if (error.status === 415 && error?.error?.message === 'El archivo no es una imagen válida') {
            this.errorImagenPerfil = 'Formato de imagen no válido.';
          } else if (error.status === 500 && error?.error?.message === 'Error al guardar la foto') {
            this.errorImagenPerfil = 'Ocurrió un error al guardar la imagen. Inténtelo de nuevo más tarde.';
          } else {
            this.errorImagenPerfil = 'Ocurrió un error inesperado al subir la imagen.';
          }
          this.statusImagenPerfil = true;
          return of(null);
        })
      ).subscribe(
        (response) => {
          if (response) {
            alert('Foto de perfil actualizada exitosamente');
          }
        },
        (error) => {
          console.error('Error al subir la foto de perfil:', error);
        }
      );
    }
  }

  cerrarModalSesionExpirada(): void {
    this.mostrarModalNoDatosPerfil = false;
    this.router.navigate(['/iniciarSesion']);
  }
}
