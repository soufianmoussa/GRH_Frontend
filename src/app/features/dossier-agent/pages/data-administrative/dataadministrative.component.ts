import { Component } from '@angular/core';
import { AgentcardComponent } from '../../../../shared/components/agent-card/agent-card.component';
import {Dialog} from 'primeng/dialog';
import {NgIf} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {Tab, TabList, TabPanel, TabPanels, Tabs} from 'primeng/tabs';
import {Table, TableModule} from 'primeng/table';
import {FloatLabelModule} from 'primeng/floatlabel';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-dataadministrative',
  imports: [
    AgentcardComponent,
    Dialog,
    NgIf,
    ReactiveFormsModule,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    TableModule,
    Tabs,
    FormsModule,
    FloatLabelModule,
    InputText,
    Button
  ],
  templateUrl: './dataadministrative.component.html',
  styleUrl: './dataadministrative.component.scss'
})
export class DataadministrativeComponent {

  searchAdmin = '';
  searchFonction = '';

  situationAdministrative =
    {
      id: 1,
      DateRecrutement: '05/01/1988',
      Grade: 'Administrateur principal A.C.',
      Echelle: '10',
      Echelon: '9',
      Indice: '701',
      Position: 'En activité'
    };

  situationFonctionnelle =
    {
      fonction: "Professeur de Mathématiques",
      Lieu: "Lycée Moulay Youssef - Rabat",
      dateEntreeService: "15/09/2010",
      datePosition: "01/09/2020"
    };


  displayDialogAdmin: boolean = false;
  displayDialogFonction: boolean = false;
  selectedItem: any;
  selectedAdmin: any;

  onViewAdmin(item: any) {
    this.selectedAdmin = item;
    console.log(this.selectedAdmin);
    this.displayDialogAdmin = true;
  }

  onViewFonction(item: any) {
      this.selectedItem = item;
      this.displayDialogFonction= true;
  }

  clear(table: Table) {
    table.clear();
    this.searchFonction = "";
  }





}
