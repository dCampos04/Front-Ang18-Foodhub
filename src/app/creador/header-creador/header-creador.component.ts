import {Component, OnInit} from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {SharedService} from "../../services/shared.service";
import {NgClass} from "@angular/common";
import {CreadorProfileDTO} from "../../interfaces/CreadorProfileDTO";
import {environment} from "../../../environments/environment.development";
import {CreadorService} from "../../services/creador.service";

@Component({
  selector: 'app-header-creador',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    NgClass
  ],
  templateUrl: './header-creador.component.html',
  styleUrl: './header-creador.component.css'
})
export class HeaderCreadorComponent implements OnInit{

  public creadorDTO: CreadorProfileDTO = {
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    correoElectronico: '',
    codigoColegiatura: '',
    fotoPerfil: '',
  };

  showHeader: boolean = true;

  public tipo: string = '';
  public imageUrl: string = '';

  constructor(private sharedService: SharedService, private router: Router, private creadorService: CreadorService) {}

  ngOnInit() {

    this.obtenerDatosPerfilCreador();

    console.log("ruta: "+ this.router.url)

    if(this.router.url === '/ingresar/miPerfil'){
      this.showHeader = false;
    }

  }

  obtenerDatosPerfilCreador() {
    this.creadorService.verPerfil().subscribe((response) => {
      this.creadorDTO = response;
      this.loadImage();
    });
  }

  loadImage() {
    this.creadorService.obtenerFotoPerfil().subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        console.log(url);
        this.imageUrl = url; // Asigna la URL creada a la propiedad de la imagen
        console.log(this.imageUrl);
      },
      (error) => {
        console.error('Error al obtener la imagen:', error);
      }
    );
  }


  isActive(route: string): boolean {
    return this.router.url === route;
  }
  isActiveCategoria(): boolean {
    const url = this.router.url;
    return url === '/categoria' || url.startsWith('/categoria/');
  }


}
