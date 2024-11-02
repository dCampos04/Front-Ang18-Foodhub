import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { RecetaCategoriaDTO } from '../../interfaces/RecetaCategoriaDTO';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';
import { environment } from '../../../environments/environment';
import {RecetaService} from "../../services/receta.service";

@Component({
  selector: 'app-body-categoria',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule],
  templateUrl: './body-categoria.component.html',
  styleUrl: './body-categoria.component.css'
})
export class BodyCategoriaComponent implements OnInit {
  @Input() categoria!: string; // Recibirá la categoría como entrada
  public urlImages: string = `${environment.apiUrl}/imagenes/`;
  public page!: number;
  public recipes: RecetaCategoriaDTO[] = [];
  public mensajeError: string = '';

  constructor(
    private router: Router,
    private sharedService: SharedService,
    private recetaService: RecetaService,
  ) {}

  ngOnInit(): void {
    this.obtenerRecetasPorCategoria(this.categoria);
  }

  obtenerRecetasPorCategoria(categoria: string) {
    // Lógica para obtener recetas según la categoría
    this.recetaService.mostrarRecetasPorCategoria(categoria).subscribe(
      (recetas) => {
        this.recipes = recetas;
        if (this.recipes.length === 0) {
          // Mostrar mensaje si no hay recetas en esta categoría
          this.mensajeError = `No hay recetas en la categoría "${categoria}" por el momento.`;
        }
      },
      (error) => {
        console.error(`Error: ${error.error.message}`);
        this.mensajeError = error.error?.message || 'Error desconocido';
      }
    );
  }

  verContenido(recipe: RecetaCategoriaDTO) {
    this.sharedService.setrecetaAlmacenada(recipe.id);
    this.router.navigate(['/cardBody2/' + recipe.id]);
    console.log(`idRecipe: ${recipe.id}`);
  }
}

