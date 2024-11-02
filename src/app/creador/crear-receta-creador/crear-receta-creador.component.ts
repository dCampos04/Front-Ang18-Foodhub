import { Component } from '@angular/core';
import { Categoria } from '../../interfaces/Categoria';
import { IngredienteDTO } from '../../interfaces/IngredienteDTO';
import { InstruccionDTO } from '../../interfaces/InstruccionDTO';
import { Router } from '@angular/router';
import { RecetaService } from '../../services/receta.service';
import { RecetaDTO } from '../../interfaces/RecetaDTO';
import { FormsModule } from '@angular/forms';
import { ConnectionStatusService } from '../../services/connection-status.service';
import { catchError, of, retry } from 'rxjs';

@Component({
  selector: 'app-crear-receta-creador',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './crear-receta-creador.component.html',
  styleUrl: './crear-receta-creador.component.css',
})
export class CrearRecetaCreadorComponent {
  step: number = 1;
  titulo: string = '';
  descripcion: string = '';
  tiempoCoccion: number = 0;
  porciones: number = 0;
  calorias: number = 0;
  categoria!: Categoria;

  imagen: string = '';

  ingredientes: IngredienteDTO[] = [{ ingrediente: '' }];
  instrucciones: InstruccionDTO[] = [{ instruccion: '' }];
  mostrarModalPublicado: boolean = false;

  selectedFile: File | null = null;
  errorRegistro: boolean = false;
  messageErrorRegistro: string = '';
  cargando: boolean = false;
  isOnline: boolean = true;

  errores: Record<string, any> = {
    titulo: '',
    descripcion: '',
    tiempoCoccion: '',
    porciones: '',
    calorias: '',
    categoria: '',
    ingredientes: '',
    instrucciones: '',
    imagen: '',
  };

  constructor(
    private connectionStatusService: ConnectionStatusService,
    private router: Router,
    private recetaService: RecetaService
  ) {}

  ngOnInit(): void {
    this.connectionStatusService.getConnectionStatus().subscribe((isOnline) => {
      this.isOnline = isOnline;
      if (!isOnline) {
        console.log('datos guardados temporalmente');
        this.guardarDatosEnLocalStorage();
      }
    });

    this.loadFormData(); // Cargar datos guardados en localStorage al iniciar
  }

  guardarDatosEnLocalStorage() {
    const formData = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      tiempoCoccion: this.tiempoCoccion,
      porciones: this.porciones,
      calorias: this.calorias,
      categoria: this.categoria,
      ingredientes: this.ingredientes,
      instrucciones: this.instrucciones,
    };
    localStorage.setItem('recetaFormData', JSON.stringify(formData));
  }

  loadFormData() {
    const savedFormData = localStorage.getItem('recetaFormData');
    if (savedFormData) {
      const formData = JSON.parse(savedFormData);
      this.titulo = formData.titulo || '';
      this.descripcion = formData.descripcion || '';
      this.tiempoCoccion = formData.tiempoCoccion || null;
      this.porciones = formData.porciones || null;
      this.calorias = formData.calorias || null;
      this.categoria = formData.categoria || null;
      this.ingredientes = formData.ingredientes || [{ ingrediente: '' }];
      this.instrucciones = formData.instrucciones || [{ instruccion: '' }];
    }
  }

  // Métodos para agregar y eliminar ingredientes
  agregarIngrediente() {
    this.ingredientes.push({ ingrediente: '' });
  }

  // Métodos para agregar y eliminar instrucciones
  agregarPaso() {
    this.instrucciones.push({ instruccion: '' });
  }

  validarCamposYPublicar() {
    this.guardarDatosEnLocalStorage();
    this.resetErrores();

    // Validar campos
    if (!this.validarCampos()) return;

    this.cargando = true;

    const nuevaReceta: RecetaDTO = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      tiempoCoccion: this.tiempoCoccion,
      porciones: this.porciones,
      calorias: this.calorias,
      categoria: this.categoria,
      ingredientes: this.ingredientes,
      instrucciones: this.instrucciones,
    };

    if (this.selectedFile) {
      this.recetaService
        .crearReceta(nuevaReceta, this.selectedFile)
        .pipe(
          retry(3),
          catchError((error) => {
            // Manejo de errores de respuesta
            if (error.status === 400) {
              this.errores['imagen'] =
                'El archivo de imagen está vacío o es inválido.';
            } else if (error.status === 415) {
              this.errores['imagen'] = 'Formato de imagen no válido';
            } else if (error.status === 500) {
              this.errores['imagen'] =
                'Ocurrió un error al guardar la imagen. Inténtelo de nuevo más tarde.';
            } else {
              this.messageErrorRegistro = 'Error inesperado al crear receta.';
            }
            this.errorRegistro = true;
            this.cargando = false;
            return of(null);
          })
        )
        .subscribe(
          (response: any) => {
            if (response !== null) {
              localStorage.removeItem('recetaFormData');
              this.mostrarModalPublicado = true;
              this.errorRegistro = false;
            }
            this.cargando = false;
          },
          (error) => {
            this.errorRegistro = true;
            this.cargando = false;
          }
        );
    } else {
      this.errores['imagen'] = 'Debe seleccionar una imagen.';
      this.errorRegistro = true;
      this.cargando = false;
    }
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
      };
      reader.onerror = (error) => {
        console.log(`Error: ${error}`);
      };
    }
  }

  // Validar todos los campos
  validarCampos(): boolean {
    let esValido = true;

    // Validación de título
    if (!this.titulo || this.titulo.trim().length === 0) {
      this.errores['titulo'] = 'El título es obligatorio.';
      esValido = false;
    }

    // Validación de descripción
    if (!this.descripcion || this.descripcion.trim().length === 0) {
      this.errores['descripcion'] = 'La descripción es obligatoria.';
      esValido = false;
    }

    // Validación de tiempo de cocción (debe ser mayor que 0)
    if (this.tiempoCoccion === null) {
      this.errores['tiempoCoccion'] = 'El tiempo de cocción es obligatorio';
      esValido = false;
    }

    if (!Number.isInteger(this.tiempoCoccion)) {
      this.errores['tiempoCoccion'] =
        'Las cantidad de porciones debe ser un número entero.';
      esValido = false;
    }

    if (this.tiempoCoccion <= 0) {
      this.errores['tiempoCoccion'] =
        'El tiempo de cocción debe ser mayor que 0.';
      esValido = false;
    }

    if (this.tiempoCoccion > 99) {
      this.errores['tiempoCoccion'] =
        'El tiempo de cocción no debe ser mayor qde 2 digitos.';
      esValido = false;
    }

    // Validación de porciones (debe ser mayor que 0)
    if (this.porciones === null) {
      this.errores['porciones'] = 'Las cantidad de porciones son obligatorias';
      esValido = false;
    }

    if (!Number.isInteger(this.porciones)) {
      this.errores['porciones'] =
        'Las cantidad de porciones debe ser un número entero.';
      esValido = false;
    }

    if (this.porciones <= 0) {
      this.errores['porciones'] =
        'La cantidad de porciones debe ser mayor que 0.';
      esValido = false;
    }

    if (this.porciones > 99) {
      this.errores['porciones'] =
        'La cantidad de porciones no debe ser mayor de 2 digitos.';
      esValido = false;
    }

    // Validación de calorías (debe ser mayor que 0)
    if (this.calorias === null || this.calorias <= 0) {
      this.errores['calorias'] =
        'Las calorías son obligatorias y deben ser mayores que 0.';
      esValido = false;
    }

    // Validación de categoría
    if (!this.categoria) {
      this.errores['categoria'] = 'La categoría es obligatoria.';
      esValido = false;
    }

    if (
      !this.ingredientes ||
      this.ingredientes.some(
        (ingrediente) => ingrediente.ingrediente.trim().length === 0
      )
    ) {
      this.errores['ingredientes'] = 'No puede dejar ingredientes en blanco.';
      esValido = false;
    }

    if (this.ingredientes.length === 0) {
      this.errores['ingredientes'] = 'No puedes crear una receta sin al menos un ingrediente.';
      esValido = false;
    }

    if (
      !this.instrucciones ||
      this.instrucciones.some(
        (instruccion) => instruccion.instruccion.trim().length === 0
      )
    ) {
      this.errores['instrucciones'] = 'No puede dejar instrucciones en blanco.';
      esValido = false;
    }

    if (this.instrucciones.length === 0) {
      this.errores['instrucciones'] = 'No puedes crear una receta sin al menos una instruccion.';
      esValido = false;
    }

    return esValido;
  }

  nextStep() {
    if (this.step < 3) {
      this.step++;
    }
  }

  prevStep() {
    if (this.step > 1) {
      this.step--;
    }
  }

  eliminarIngrediente(index: number) {
    this.ingredientes.splice(index, 1);
    this.errores['ingredientes'].splice(index, 1); // Eliminar también el error correspondiente
  }

  eliminarPaso(index: number) {
    this.instrucciones.splice(index, 1);
    this.errores['instrucciones'].splice(index, 1); // Eliminar también el error correspondiente
  }

  cerrarModalPublicado() {
    this.mostrarModalPublicado = false;
    this.router.navigate(['/ingresar/gestionDeRecetas']);
  }

  resetErrores() {
    this.errorRegistro = false;
    this.errores = {
      titulo: '',
      descripcion: '',
      tiempoCoccion: '',
      porciones: '',
      calorias: '',
      categoria: '',
      ingredientes: '',
      instrucciones: '',
      imagen: '',
    };
  }
}
