import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { RecetaService } from '../../services/receta.service';
import { RecetaBodyDTO } from '../../interfaces/RecetaBodyDTO';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-card-body2',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './card-body2.component.html',
  styleUrl: './card-body2.component.css',
})
export class CardBody2Component implements OnInit {
  public recetaDTO!: RecetaBodyDTO;
  public imageUrl: string = '';

  constructor(
    private recetaService: RecetaService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const recetaId = params['id'];

      this.recetaService.verReceta(recetaId).subscribe(
        (data) => {
          this.recetaDTO = data;
          this.loadImage(recetaId);
        },
        (error) => {
          console.error('Error al obtener receta:', error);
        }
      );
    });
  }

  loadImage(id: number) {
    this.recetaService.obtenerUrlImage(id).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        this.imageUrl = url; // Asigna la URL creada a la propiedad de la imagen
      },
      (error) => {
        console.error('Error al obtener la imagen:', error);
      }
    );
  }

  goBack() {
    window.history.back();
  }

  insertarEspaciosAutomaticos(texto: string): string {
    // Añade un espacio entre palabras camel case (ejemplo: "HelloWorld" -> "Hello World")
    texto = texto.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Añade un espacio cada 15 caracteres si el texto no tiene espacios
    if (!/\s/.test(texto)) {
      texto = texto.replace(/(.{20})/g, '$1 ');
    }

    return texto;
  }
}
