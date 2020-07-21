import {Component, NgModule, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CinemaService} from '../services/cinema.service';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import Swal from 'sweetalert2';
@NgModule({
  //=> Basic usage (forRoot can also take options, see details below)
 // imports: [SweetAlert2Module.forRoot()],

  //=> In submodules only:
  imports: [SweetAlert2Module],

  //=> In submodules only, overriding options from your root module:
  //imports: [SweetAlert2Module.forChild({ /* options */ })]
})
export class AppModule {
}

@Component({
  selector: 'app-cinema',
  templateUrl: './cinema.component.html',
  styleUrls: ['./cinema.component.css']
})
export class CinemaComponent implements OnInit {
  private villes;
  private cinemas;
  private currentVille;
  private currentCinema;
  private salles;
  private projections;
  private currentProjection;
  private selectedTickets:any;

  constructor(public cinemaService:CinemaService) { }

  ngOnInit() {
    //recuperer la liste des cinema
    this.cinemaService.getVilles()
  .subscribe(data=> {
    this.villes = data;
  },err=>{
    console.log(err);

  })}


  oneGetCinema(v: any) {
    this.salles=undefined;
    this.currentVille=v;
    this.cinemaService.getCinemas(v)
      .subscribe(data=> {
        this.cinemas = data;
      },err=>{
        console.log(err);

      })
  }

  onGetSalle(c: any) {
    this.currentCinema=c;
    this.cinemaService.getSalles(c)
      .subscribe(data=> {
        this.salles = data;
        this.salles._embedded.salles.forEach(salle=>{
          this.cinemaService.getProjections(salle)
            .subscribe(data=> {
              salle.projections = data;
            },err=>{
              console.log(err);

            })
        })

      },err=>{
        console.log(err);

      })
  }

  onGetTicketPlaces(p: any) {
    this.currentProjection=p;
    this.cinemaService.getPlaces(p)
      .subscribe(data=> {
        this.currentProjection.tickets = data;
        this.selectedTickets=[];

      },err=>{
        console.log(err);

      })

  }

  onSelectTicket(t) {
if(!t.selected){
  t.selected=true;
  this.selectedTickets.push(t);
}
else{
  t.selected=false;
  this.selectedTickets.splice(this.selectedTickets.indexOf(t),1);
}

  }

  getTicketClass(t) {
   let str="";
   if(t.reserve==true){
     str+="btn-danger";
   }
   else if(t.selected){
     str+="btn-warning"
   }
   else{
     str+="btn-success"
   }
   return str;
  }

  onPayTickets(dataForm) {
    let tickets=[];
    this.selectedTickets.forEach(t=>{
      tickets.push(t.id);
    });
    dataForm.tickets=tickets;
    this.cinemaService.payerTickets(dataForm)
      .subscribe(data=>{
        Swal.fire(
          'Tickets résérvés avec succes!',
          '',
          'success'
        )

        //alert("Tickets Reserves avec succes!");
        this.onGetTicketPlaces(this.currentProjection);
      },err=>{
        console.log(err);

      })
  }
}
