import { Component, OnInit } from '@angular/core';
import { AuthDTO } from '../../interfaces/AuthDTO';
import { Router, RouterLink } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './iniciar-sesion.component.html',
  styleUrl: './iniciar-sesion.component.css',
})
export class IniciarSesionComponent implements OnInit {
  public authDTO: AuthDTO = { identificador: '', contrasenia: '' };
  public tipo: string = '';

  mostrarModalSesionExpirada: boolean = false;

  public isCreador: boolean = false;

  errorRegistro: boolean = false;
  errorIdentificador: boolean = false;
  errorContrasenia: boolean = false;
  mensajeError: string = '';
  mensajeErrorIdentificador: string = '';
  mensajeErrorContrasenia: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {

    localStorage.setItem('sesion', 'false');

    this.sharedService.setBooleanVariable(false);

    console.log("HOLAAAAAA"+ this.sharedService.getBooleanVariable())


    // Nos suscribimos al estado del modal de sesión expirada
    this.sharedService.obtenerEstadoModalSesionExpirada().subscribe(
      (estado) => {
        this.mostrarModalSesionExpirada = estado;
      }
    );
  }

  async iniciarSesion(): Promise<void> {
    this.resetErrores();

    if (!this.validarCampos()) return;

    try {
      const response = await this.authService.iniciarSesionCreador(this.authDTO).toPromise();

      // localStorage.setItem('token', response.token);
      this.router.navigate(['/ingresar']);

      this.sharedService.setBooleanVariable(true);
      console.log("HOLAAAAAA"+ this.sharedService.getBooleanVariable())


    } catch (error) {
      this.manejarErrorSesion(error);
    }
  }

  validarCampos(): boolean {
    let esValido = true;

    if (!this.authDTO.identificador) {
      this.setError('identificador', 'El campo de correo o código de colegiado es obligatorio.*');
      esValido = false;
    } else if (this.authDTO.identificador.length !== 6 && !this.validarCorreo(this.authDTO.identificador)) {
      this.setError('identificador', 'El formato del correo electrónico es incorrecto.*');
      esValido = false;
    }

    if (!this.authDTO.contrasenia) {
      this.setError('contrasenia', 'El campo de contraseña es obligatorio.*');
      esValido = false;
    }

    return esValido;
  }

  validarContrasenia(contrasenia: string) {
    if (/\s/.test(contrasenia)) {
      this.errorContrasenia = true;
      this.mensajeErrorContrasenia = 'La contraseña no debe contener espacios.';
    } else {
      this.errorContrasenia = false;
      this.mensajeErrorContrasenia = '';
    }
  }

  setError(campo: string, mensaje: string): void {
    if (campo === 'identificador') {
      this.errorIdentificador = true;
      this.mensajeErrorIdentificador = mensaje;
    } else if (campo === 'contrasenia') {
      this.errorContrasenia = true;
      this.mensajeErrorContrasenia = mensaje;
    }
  }

  manejarErrorSesion(error: any): void {
    console.error('Error al iniciar sesión:', error);
    this.errorRegistro = true;
    this.mensajeError = error.error?.message || 'Error al iniciar sesión';
  }

  resetErrores(): void {
    this.errorRegistro = false;
    this.errorIdentificador = false;
    this.errorContrasenia = false;
    this.mensajeError = '';
    this.mensajeErrorIdentificador = '';
    this.mensajeErrorContrasenia = '';
  }


  validarCorreo(correo: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(correo);
  }



  cerrarModalSesionExpirada(): void {

    console.log("HOLAAAAAA"+ this.sharedService.getBooleanVariable())


    this.mostrarModalSesionExpirada = false;
    this.router.navigate(['/iniciarSesion']);
    this.sharedService.activarModalSesionExpirada(false); // Desactivar modal
    this.sharedService.setBooleanVariable(false);
  }
}
