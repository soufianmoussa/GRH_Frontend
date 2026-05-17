import {Component, OnInit} from '@angular/core';
import {TestService} from '../../services/test.service';
import {AuthService} from '../../core/auth/auth.service';

@Component({
  selector: 'app-accueil',
  imports: [],
  templateUrl: './accueil.component.html',
  styleUrl: './accueil.component.scss'
})
export class AccueilComponent implements OnInit {

  roles: string[] = [];

  constructor(private authService: AuthService, private testService: TestService) { }

  ngOnInit() {
    this.testService.getTest().subscribe({
      next: (res) => {
        console.log('Backend data:', res);
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });

    this.roles = this.authService.getRoles();
  }

}
