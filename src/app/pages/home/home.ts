import { Component, inject, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { trigger, transition, style, animate } from '@angular/animations';

import { WeatherService } from '../../services/weather';


@Component({  /* un décorateur Angular : le composant, son HTML, son style, ses dépendances */
  selector: 'app-home', /* nom HTML du composant. */
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  animations: [
      trigger('slideAnimation', [
        transition(':enter', [
          style({ width: '0', opacity: 0, overflow: 'hidden' }),
          animate('500ms ease-out', style({ width: '280px', opacity: 1 })) 
        ]),
        transition(':leave', [
            animate('400ms ease-in', style({ width: '0', opacity: 0 })) 
        ])
      ])
    ]
})

export class Home { /* classe typescript : le cerveau du composant, là où toute la logique vit */

  private weatherService = inject(WeatherService); /* on connecte le composant au service météo : appel API, récupére les données */ 
  private cdr = inject(ChangeDetectorRef);
  

  city = ''; /* variable */
  weatherData: any = null;
  error = '';
  state: 'search' | 'loading' | 'result' = 'search';
  searchOpen = false;
  showSearchBar = false; 
  hoverCity = '';

  forecastList: any[] = [];
  selectedDayIndex: number = 0;


  searchCity() { /* fonction appelée quand on clique sur le bouton */
    if (this.city === '') return; /* si ville est vide */
    console.log("SEARCH CLICKED", this.city);
    this.state = 'loading';
    this.searchOpen = false;
    this.showSearchBar = false;

    this.weatherService.getWeather(this.city)
      .subscribe({/* Les appels HTTP sont asynchrones : API met du temps à répondre. */
        next: (data) => { /* exécuté quand l’API répond correctement : aller chercher météo de Paris / quand l'api répond / ":" contient*/
          console.log("API OK", data)
          this.weatherData = data; /* sauvegarde les données météo dans la variable. */
          this.state = 'result';
          this.cdr.detectChanges();
        },
        error: (err) => { /* exécuté si : ville inexistante, erreur API, problème réseau  / si erreur :*/
          console.log("API ERROR", err)
          this.state = 'search';
          this.cdr.detectChanges(); 
        }
      });

       // Appel prévisions 5 jours
      this.weatherService.getForecast(this.city).subscribe({
        next: (forecastData: any) => {
          console.log("PREVISIONS OK", forecastData);
          
          // Filtrer pour garder une prévision par jour (celle de 12h00)
          const dailyForecasts = forecastData.list.filter((item: any) => 
            item.dt_txt.includes("12:00:00")
          );
          
          // Formater les données
          this.forecastList = dailyForecasts.map((item: any, index: number) => ({
            day: new Date(item.dt * 1000).toLocaleDateString('fr-FR', { weekday: 'long' }),
            temp: Math.round(item.main.temp),
            isActive: index === this.selectedDayIndex
          }));
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log("ERREUR PREVISIONS", err);
        }
      });
  }

  searchFromHover() {
    if (this.hoverCity === '') return;
    this.city = this.hoverCity;
    this.hoverCity = '';
    this.searchCity();
  }

  openSearchOverlay() {
    this.searchOpen = !this.searchOpen;
  }

  closeSearchBar() {
    this.hoverCity = '';        // Efface le texte
    this.showSearchBar = false; // Ferme la barre
  }

  selectDay(index: number) {
    this.selectedDayIndex = index;
    
    // Parcourir tous les jours
    for (let i = 0; i < this.forecastList.length; i++) {
      if (i === index) {
        this.forecastList[i].isActive = true;   // Jour cliqué = actif
      } else {
        this.forecastList[i].isActive = false;  // Autres jours = inactifs
      }
    }
  }
  
}
